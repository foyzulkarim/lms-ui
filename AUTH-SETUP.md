# Authentication Setup Instructions

This document outlines how to set up and use the Google authentication in this application.

## Prerequisites

1. Backend server running with Google OAuth configured
2. Google OAuth credentials (Client ID and Secret) configured in backend
3. Node.js installed on your system

## Environment Variables

Create a `.env` file in the root of the frontend project with:

```
# API URL for backend
VITE_API_URL="http://localhost:3000/api"
```

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```
   cd learnwith-backend-auth
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables in a `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=your_database_url
   JWT_SECRET=your_secret_key_at_least_32_chars
   FRONTEND_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd lms-ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

## Authentication Flow

1. Click "Login" or "Register" in the header
2. Click "Continue with Google" 
3. You'll be redirected to Google's login page
4. After authenticating, you'll be redirected back to the application
5. Protected routes (/profile, /course/*, etc.) will require authentication

## Testing Protected Routes

Once logged in, you can access:
- Profile page
- Course pages
- Creator dashboard

If you're not logged in and try to access these routes, you'll be redirected to the login page.

## Logout

Click on your profile picture in the header and select "Sign out" to log out.

## Troubleshooting

- If authentication fails, check that your Google OAuth credentials are correctly configured
- Check the browser console and server logs for error messages
- Ensure the backend is running and accessible from the frontend
- Verify that cookies are being properly set and sent with requests 
