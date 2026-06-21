const mongoose = require("mongoose");



function connectToDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("server is connected to DB")
    })
    .catch(err => {
        console.log("Error connecting to DB")
        console.log(err)
        process.exit(1)  /* is ka mtlb yeh hai agr mera server database se connect nhi ho paata hai to hum apne  server ko yha hi bnd krdege */
    })
}

module.exports= connectToDB;
