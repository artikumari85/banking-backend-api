const transactionModel=require("../models/transaction.model");
const ledgerModel=require("../models/ledger.model");
const emailService=require("../services/email.service")
const accountModel=require("../models/account.model")
const mongoose = require("mongoose")


/**
 * *-Create a new transaction
 * THE 10-STEPS TRANSFER FLOW:
 * 1.Validate request-jo hamare pass fromaccount,toaccount or jo amount hai vo sahi format me hai ki nhi yeh sb check krni hogi
 * 2.Validate idempotency key
 * 3.Check account status-jo account hai kahin vo close to nhi hai yeh sari chezon ko check krn hoga
 * 4.Derive sender balance from ledger-phir jo sender ka balance hai jiske account se paise katne wale hai ki usske account me sufficient balance hai ki nhi yeh humko check krn rahega
 * 5.Create transaction (PENDING)-transaction create hoga but usski status jo hogi vo pending rhe gi
 * 6.Create DEBIT ledger entery-phir yha pr debit or
 * 7.Create CREDIT ledger entry-credit entry creates karege dono ledger entry
 * 8.Mark transaction COMPLETED-mark the transaction mtlb jaisi hi meri ledger transaction complete hui hum mark as completed kr dege
 * 9.Commit MongoDB session-phir commit krde mongodb session ko and transaction ko complete karege
 * 10.Send email notification-or ek email send krdege! agr notification service ki help se humko notification send krn hai
 * to hum jyege email.service me  vha pe ek function create karege
 */

async function createTransation(req,res){

    /**
     * 1.Validate request
     */
    const {fromAccount,toAccount,amount,idempotencykey}=req.body

    if(!fromAccount || !toAccount || !amount || !idempotencykey){
        return res.status(400).json({
            message:"FromAccount,toAccount,amount and idempotencykey are required"
        })
    }

    const fromUserAccount= await accountModel.findOne({
        _id:fromAccount,
    })
    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invaild fromAccount or toAccount"
        })
    }

    /**
     * 2.Vaildate idempotenctkey
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencykey:idempotencykey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already processed",
                transaction:isTransactionAlreadyExists
            })

            if(isTransactionAlreadyExists.status === "PENDING"){
                return res.status(202).json({
                    message:"Transaction is still processing"
                })
            }

            if(isTransactionAlreadyExists.status === "FAILED"){
                return res.status(500).json({
                    message:"Transaction processing failed,please retry"
                })
            }

            if(isTransactionAlreadyExists.status === "REVERSED"){
               return res.status(500).json({
                    message:"Transaction was reversed,please retry"
                })
            }
        }
    }
     /**
      * 3.Check account status
      */
     if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
     }

     /**
      * 4.Derive sender balance from ledger
      */
    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}. Requested amoutnt is ${amount}`
        })
    } 

    let transaction;
    try{
    /**
     * 5.Create transaction(PENDING)
     */
      const session = await mongoose.startSession()
      session.startTransaction()

       transaction = ( await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencykey,
        status:"PENDING"
      }] , {session}))[0]

      const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount, 
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
      }],{session})

 
      await(()=>{
        return new Promise((resolve)=> setTimeout(resolve, 100 * 1000))
      })

      const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
      }],{session})

      transaction.status = "COMPLETED"
      await transaction.save({session})

      await transactionModel.findOneAndUpdate(
        { _id:transaction._id },
        { status: "COMPLETED" },
        { session }
      )
      await session.commitTransaction()
      session.endSession()
    } 
    catch (error){
        await transactionModel.findByIdAndUpdate(
            {idempotencykey: idempotencykey},
            {status:"FAILED"}
        )
        return res.status(500).json({
            message:"Transaction is Pending due to some issues please retry after sometimes"

        })
    }
      /**
       * 10.Send email notification
       */
      await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

      return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transaction
      })

}

async function createInitialFundsTransaction(req,res){
    const {toAccount , amount, idempotencykey} = req.body

    if(!toAccount || !amount || !idempotencykey){
        return res.status(400).json({
            message:"toAccount, amount and idempotencykey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"

        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencykey,
        status:"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message:"Inital funds transaction completed successful",
        transaction:transaction
    })
}

module.exports ={
    createTransation,
    createInitialFundsTransaction
}
