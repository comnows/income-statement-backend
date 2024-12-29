# Income Statement

Income Statement is providing REST API to income statement application that allow
users to record their financial activities of their bank accounts, enable users to
understand their spending habit and planning their future finances.

### Project support features

- Users can login and register their accounts
- Can add, access and delete their bank account
- Can add, access and delete their transaction category
- Can access to all their transactions and create a new transaction with note and transaction slip image
- Can access transaction summary
- Can filter when access their transactions includes summary

### Usage

#### Install

```
npm install
```

#### Run the app

```
npm run build
npu run dev
```

### API Endpoints

| HTTP Verbs | Endpoints                     | Action                                                                                                 |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `POST`     | `/api/v1/auth/register`       | To register a new user account                                                                         |
| `POST`     | `/api/v1/auth/login`          | To login an existing user account                                                                      |
| `POST`     | `/api/v1/account/`            | To add a new bank account info                                                                         |
| `DELETE`   | `/api/v1/account/:id`         | To delete an existing bank account info (also delete all your transaction history of deleting account) |
| `POST`     | `/api/v1/category/`           | To add a new transaction category                                                                      |
| `DELETE`   | `/api/v1/category/:id`        | To delete an existing transaction category                                                             |
| `POST`     | `/api/v1/transaction/`        | To add a new transaction                                                                               |
| `GET`      | `/api/v1/transaction/`        | To get all your transactions                                                                           |
| `GET`      | `/api/v1/transaction/summary` | To get all your transactions summary each month                                                        |

### Technologies Used

- NodeJS
- Fastify
- MongoDB
- AWS S3

### What's next

1. **Upcoming Features**

- Add balance calculation and finances planning for each month
- Import data from excel, csv, json, google sheet
- Export data to excel, csv, json, google sheet

2. **Improvements**

- Support multiple languages
- Refactor API endpoints for better scalability
- Add type validation to all API endpoints
