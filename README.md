# Email Scheduler API

A backend service built using **Node.js, Express, and MongoDB** that allows users to **schedule emails** to be sent at a future date and time.

This project supports **CRUD operations**, **email rescheduling**, **failure handling**, and **background email processing**.  
It is designed with clean architecture and validations.

---

## Features

- Create and schedule emails for future delivery
- Update email content or reschedule delivery time
- Delete scheduled emails
- Fetch all emails or a single email
- Fetch failed or unsent emails
- Background job to send emails automatically
- Input validation and proper error handling

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **SendGrid** – Email delivery service
- **node-scheduler** – Background scheduler

---


---

## Setup & Installation

### Clone Repository
```bash
git clone https://github.com/paramesh244/email-scheduler.git
cd email-scheduler
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

FROM_EMAIL must be verified in SendGrid (Single Sender Verification).

 Running the Application
```bash
npm start
```

## Server will start on:

http://localhost:3000


## How Scheduling Works

Emails are scheduled using a **job-based scheduler** (`node-schedule`) instead of a cron-based polling mechanism.

1. An email is created with a `scheduledAt` timestamp (ISO 8601 format).
2. The email is stored in the database with status `PENDING`.
3. At the time of creation, a **one-time scheduled job** is created using `node-schedule`.
4. The scheduler triggers the job **exactly at the specified `scheduledAt` time**.

### When the scheduled job runs:
- The email is sent using **SendGrid**
- On success:
  - Email status is updated to `SENT`
- On failure:
  - Email status is updated to `FAILED`
  - Failure reason is stored in the database

5. After execution (success or failure), the scheduled job is removed from memory to prevent leaks.

### Update & Delete Behavior
- On update:
  - The existing scheduled job is cancelled
  - A new job is scheduled with the updated details
- On delete:
  - The corresponding scheduled job is cancelled to prevent execution

### Server Restart Handling
- On application startup, all `PENDING` emails are fetched from the database
- Jobs are re-scheduled in memory to ensure no emails are missed after a restart

All timestamps are handled in **UTC** to avoid timezone-related issues.




## Postman Collection File

The Postman collection is available in the repository:

Email Scheduler API.postman_collection.json



## Validations

Valid email format required

scheduledAt must be a valid future ISO date

System fields (status, _id) cannot be updated manually

SENT emails cannot be modified

## Design Decisions

Single update route is used since rescheduling is simply updating scheduledAt

UTC timestamps are used to avoid timezone issues

External services (SendGrid) are abstracted into service layer



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

