# Banking Backend API

A production-style backend API for a banking system. Banking Backend API handles user authentication, account management, idempotent money transfers, double-entry ledger records, MongoDB transactions, and email notifications.

## Highlights

- JWT-based authentication with cookie and bearer-token support
- Secure password hashing with bcrypt
- Token blacklist flow for logout
- Protected account APIs for account creation, listing, and balance checks
- Double-entry ledger model with debit and credit records
- Idempotency-key based transaction handling to prevent duplicate transfers
- MongoDB session transactions for safer money movement
- System-user route for initial fund allocation
- Email notifications for registration and successful transfers

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens
- bcrypt / bcryptjs
- Nodemailer
- dotenv

## Project Structure

```text
.
|-- server.js
|-- src
|   |-- app.js
|   |-- config
|   |   `-- db.js
|   |-- controllers
|   |   |-- account.controller.js
|   |   |-- auth.controller.js
|   |   `-- transaction.controller.js
|   |-- middleware
|   |   `-- auth.middleware.js
|   |-- models
|   |   |-- account.model.js
|   |   |-- blackList.model.js
|   |   |-- ledger.model.js
|   |   |-- transaction.model.js
|   |   `-- user.model.js
|   |-- routes
|   |   |-- account.routes.js
|   |   |-- auth.routes.js
|   |   `-- transaction.routes.js
|   `-- services
|       `-- email.service.js
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file from the example file:

```bash
cp .env.example .env
```

Update the values for MongoDB, JWT, and email credentials.

### 3. Run the server

```bash
npm run dev
```

For production:

```bash
npm start
```

The API runs on `http://localhost:3000` by default.

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `EMAIL_USER` | Gmail address used by Nodemailer |
| `CLIENT_ID` | Google OAuth client ID |
| `CLIENT_SECRET` | Google OAuth client secret |
| `REFRESH_TOKEN` | Google OAuth refresh token |

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user and create a default account |
| `POST` | `/api/auth/login` | Login and receive a JWT |
| `POST` | `/api/auth/logout` | Logout and blacklist the active token |

### Accounts

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/accounts` | Create a new account for the logged-in user |
| `GET` | `/api/accounts` | Get all accounts for the logged-in user |
| `GET` | `/api/accounts/balance/:accountId` | Get account balance from ledger entries |

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/transactions` | Transfer funds between two active accounts |
| `POST` | `/api/transactions/system/initial-funds` | Allocate initial funds from a system user |

## Example Transaction Request

```json
{
  "fromAccount": "account_id_here",
  "toAccount": "account_id_here",
  "amount": 500,
  "idempotencykey": "unique-transfer-key-001"
}
```
