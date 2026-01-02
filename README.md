# Email Scheduler API

A backend service built using **Node.js, Express, and MongoDB** that allows users to **schedule emails** to be sent at a future date and time.

This project supports **CRUD operations**, **email rescheduling**, **failure handling**, and **background email processing** using a cron job.  
It is designed with clean architecture, validations.

---

## Features

- Create and schedule emails for future delivery
- Update email content or reschedule delivery time
- Delete scheduled emails
- Fetch all emails or a single email
- Fetch failed or unsent emails
- Background cron job to send emails automatically
- Input validation and proper error handling

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **SendGrid** – Email delivery service
- **node-cron** – Background scheduler

---


---

## Setup & Installation

### Clone Repository
```bash
git clone <repository-url>
cd email-scheduler-api
```

### Install Dependencies
```bash
npm install
```

###  Environment Variables

Create a .env file using the example below:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/email_scheduler
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=verified_sender_email@gmail.com
```

 ### FROM_EMAIL must be verified in SendGrid (Single Sender Verification).

 Running the Application
```bash
npm start
```

## Server will start on:

http://localhost:3000


### The email scheduler cron job runs every minute automatically.

## How Scheduling Works

Email is created with a scheduledAt timestamp (ISO 8601 format).

Email is stored with status PENDING.

A cron job runs every minute.

If scheduledAt <= current time:

Email is sent using SendGrid

Status is updated to SENT

If sending fails:

Status is updated to FAILED

Failure reason is stored

All timestamps are handled in UTC.

### Postman Collection

This project includes a Postman collection to test all available APIs.

## Collection File

The Postman collection is available in the repository:

Email Scheduler API.postman_collection.json

## How to Use

Open Postman

Click Import

Select File

Choose Email-Scheduler.postman_collection.json from the repo


## Validations

Valid email format required

scheduledAt must be a valid future ISO date

System fields (status, _id) cannot be updated manually

SENT emails cannot be modified

## Design Decisions

Single update route is used since rescheduling is simply updating scheduledAt

UTC timestamps are used to avoid timezone issues

External services (SendGrid) are abstracted into service layer

Cron job is used instead of queue for simplicity

## Possible Improvements

Retry mechanism for failed emails

Pagination for listing emails

Authentication & authorization

Queue-based processing (BullMQ / RabbitMQ)

Dockerization


## Conclusion

This project demonstrates:

Clean backend architecture

Practical scheduling logic

Proper error handling

Real-world API design

Testable and maintainable code

