# Google Calendar Call Alert System

This application allows users to authenticate with their Google account, access their Google Calendar events, and receive automated phone call reminders via Twilio when events are approaching.

## Features

- Google OAuth authentication
- Google Calendar integration
- Automated phone call reminders using Twilio
- Scheduled cron jobs to check for upcoming events

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **APIs**: Google Calendar API, Twilio API
- **Scheduling**: node-cron

## Prerequisites

- Node.js (v22.x)
- npm (v10.x)
- MongoDB
- Google Cloud Platform account with OAuth credentials
- Twilio account with API credentials

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/google-calendar-call-alert.git
cd google-calendar-call-alert
```

### 2. Environment Variables

#### Backend (.env file in server directory)

```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/calendar-alert

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_CALENDAR_REDIRECT_URL=http://localhost:5000/api/auth/google/calendar/callback

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Frontend URL
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env file in client directory)

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Start Development Servers

```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd ../client
npm run dev
```

### 5. Setting up Google Cloud Platform

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 credentials (Web application type)
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/calendar/callback`

### 6. Setting up Twilio

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number or use the trial number

## Project Structure

The project follows a clear separation of concerns with a client-server architecture:

- **Client**: React application built with Vite
- **Server**: Node.js/Express API with MongoDB integration

## Security Considerations

- JWT authentication for API endpoints
- Secure storage of OAuth tokens
- Environment variables for sensitive information
- HTTP-only cookies for token storage
- CORS configuration

## Deployment

For production deployment:

1. Build the frontend:
```bash
cd client
npm run build
```

2. Set up production environment variables on your hosting platform
3. Configure a production MongoDB instance
4. Update the OAuth redirect URIs in Google Cloud Console
5. Deploy the backend to your chosen hosting platform (Heroku, AWS, etc.)

## License

MIT