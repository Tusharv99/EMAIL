Project Overview
A full-stack email scheduling application built with React, Express, PostgreSQL, and BullMQ. This project implements a complete email scheduling system with CSV upload, rate limiting, and real-time status tracking.

🏗️ Architecture
text
Frontend (React + Vite)
         ↓
Express REST API
         ↓
PostgreSQL (Persistent Storage)
         ↓
BullMQ Queue (Redis)
         ↓
Email Worker → Ethereal SMTP
How Scheduling Works
User composes email → Uploads CSV with recipients

Backend validates → Creates Campaign and Email records

Each email gets a calculated scheduledAt time (startTime + delay * index)

BullMQ jobs are created with delay set to the scheduled time

Worker processes jobs at the scheduled time and sends emails via Ethereal

Persistence on Restart
All email data is stored in PostgreSQL (source of truth)

BullMQ jobs persist in Redis with defaultJobOptions.removeOnComplete: false

On server restart, BullMQ recovers pending jobs from Redis

Failed jobs are retried based on configuration

Rate Limiting & Concurrency
Hourly rate limit: Controlled via MAX_EMAILS_PER_HOUR env variable

Worker concurrency: Controlled via WORKER_CONCURRENCY env variable

Minimum delay: Controlled via MIN_EMAIL_DELAY_MS env variable

Distributed locking: Redis-based locking ensures rate limits are shared across multiple instances

🚀 Features Implemented
Backend
Feature	Status
Express REST API	✅
PostgreSQL + Prisma ORM	✅
Development Authentication	✅
Email Scheduling	✅
Campaign Creation	✅
CSV Upload & Validation	✅
Scheduled/Sent Email Lists	✅
Pagination	✅
Idempotency (per email)	✅
Email Status Tracking	✅
Frontend
Feature	Status
Login Page	✅
Dashboard	✅
Compose Email (with CSV upload)	✅
Scheduled Emails Table	✅
Sent Emails Table	✅
Email Validation (frontend)	✅
Empty States	✅
Loading States	✅
Reusable Components	✅
In Progress / Next Steps
🚧 Redis + BullMQ integration

🚧 Ethereal email sending

🚧 Worker concurrency & rate limiting

🚧 Elasticsearch for email search

🚧 Slack OAuth & notifications

📦 Tech Stack
Backend
Runtime: Node.js + Express

Language: TypeScript

Database: PostgreSQL + Prisma ORM

Queue: BullMQ + Redis

Email: Nodemailer + Ethereal

Auth: Session-based (development)

Frontend
Framework: React + Vite

Language: TypeScript

Styling: Tailwind CSS

Routing: React Router

HTTP: Axios

🔧 Prerequisites
Node.js (v18 or higher)

PostgreSQL (local installation)

Redis (local installation)

npm or yarn

📝 Environment Variables
Backend (.env)
env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/email"

# CORS
CLIENT_URL="http://localhost:5173"

# Session (for development auth)
SESSION_SECRET="dev-local-email-scheduler"

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# Ethereal Email (get from https://ethereal.email)
ETHEREAL_USER="your-ethereal-user@ethereal.email"
ETHEREAL_PASS="your-ethereal-password"

# Worker Configuration
WORKER_CONCURRENCY=5
MAX_EMAILS_PER_HOUR=5
MIN_EMAIL_DELAY_MS=2000
Frontend (.env)
env
VITE_API_URL=http://localhost:5000
🏃 How to Run
1. Clone & Install
bash
# Clone the repository
git clone <repository-url>
cd email-scheduler

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
2. Setup Database
bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
3. Start Redis
bash
# On macOS with Homebrew
brew services start redis

# Or start manually
redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG
4. Run Backend
bash
cd backend
npm run dev
Server will start at: http://localhost:5000

5. Run Frontend
bash
cd frontend
npm run dev
App will start at: http://localhost:5173

6. Run Worker (Not yet implemented)
bash
cd backend
npm run worker
🔐 Development Authentication
This project uses a simple development authentication system:

No Google OAuth required

A demo user is automatically created in the database

Session-based authentication with HTTP-only cookies

Click "Continue to Dashboard" to login

Note: This is for development only. Production should use proper OAuth/SSO.

📧 How to Test Email Sending
1. Get Ethereal Credentials
Go to https://ethereal.email

Click "Create Account"

Copy the generated credentials (user & pass)

2. Configure Environment
Add the credentials to your .env file:

env
ETHEREAL_USER="your-ethereal-user@ethereal.email"
ETHEREAL_PASS="your-ethereal-password"
3. Create a Test CSV
Create test-emails.csv:

csv
email
john@gmail.com
alice@gmail.com
bob@gmail.com
4. Schedule an Email
Login to the dashboard

Click "Compose New Email"

Fill in subject and body

Upload your CSV

Set start time and schedule

5. View Sent Emails
Check the Scheduled tab for pending emails

After sending, check the Sent tab for completed emails

📁 Project Structure
text
email-scheduler/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   ├── workers/        # BullMQ workers
│   │   ├── prisma/         # Prisma schema
│   │   └── index.ts        # Server entry
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
└── README.md
🗄️ Database Schema
Users
id, email, name, googleId, avatarUrl

Has many Campaigns, Senders, and one SlackConnection

Campaigns
id, name, description, userId

Groups emails together

Senders
id, name, email, userId, isActive

Email sender configurations

Emails
id, subject, body, recipient, senderId, campaignId

status: SCHEDULED | PROCESSING | SENT | FAILED

scheduledAt, sentAt, failedAt, errorMessage, retryCount

SlackConnections
id, userId, teamId, accessToken, isActive

🔄 Email Status Flow
text
SCHEDULED → PROCESSING → SENT
                ↓
            FAILED (retry)
🚨 Known Issues & Limitations
Google OAuth: Not implemented (using development auth instead)

Slack OAuth: Not yet implemented

Elasticsearch: Not yet implemented

BullMQ Worker: Implementation in progress

Email Sending: Requires BullMQ worker to be running

📚 API Endpoints
Authentication
text
POST /api/auth/login      - Login with demo user
POST /api/auth/logout     - Logout
GET  /api/auth/me         - Get current user
Emails
text
POST /api/emails/schedule        - Schedule emails
GET  /api/emails/scheduled       - Get scheduled emails
GET  /api/emails/sent            - Get sent emails
DELETE /api/emails/:id/cancel    - Cancel scheduled email
Health
text
GET /api/health           - Health check
GET /api/test             - Test endpoint
🧪 Testing
bash
# Test backend health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login -c cookies.txt

# Test scheduling (requires sender ID)
curl -X POST http://localhost:5000/api/emails/schedule \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "subject": "Test",
    "body": "Hello!",
    "recipients": ["test@example.com"],
    "startTime": "2026-08-31T10:00:00.000Z",
    "delayMs": 2000,
    "hourlyLimit": 5,
    "senderId": "YOUR_SENDER_ID"
  }'
🚧 Upcoming Features
□ BullMQ worker for email sending
□ Ethereal email integration
□ Rate limiting with Redis
□ Elasticsearch for email search
□ Slack OAuth & notifications
□ Bull Board dashboard
□ Server restart recovery
□ Google OAuth (optional)
