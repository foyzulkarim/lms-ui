<!-- filepath: /Users/foyzul/personal/lmsai/lms-ui/DATA-ACCESS.md -->
# Data Access in LearnFlow

This document explains how data access works in the LearnFlow application, particularly focusing on how to run the production build locally.

## Current Data Access Approach

The LearnFlow application now uses a real API for all data access:

1. **API-Based Data Access**: We use a real backend API for all data operations.
2. **No Mock Data**: Mock data functionality has been completely removed.
3. **Real Backend Required**: A functioning backend API is required to run the application.

## How to Run Locally

To run the application locally:

1. Start the backend API server first:

   ```bash
   # Navigate to the backend folder and start the server
   # Your actual command may vary depending on the backend setup
   npm run dev
   ```

2. Start the frontend development server:

   ```bash
   npm run dev
   ```

3. Or build and preview the production build:

   ```bash
   npm run build
   npm run preview
   ```

4. Open the application in your browser (typically at `http://localhost:5173` for dev or `http://localhost:4173` for preview).

## API Configuration

The API URL is configured through the `VITE_API_URL` environment variable and defaults to `http://localhost:4000` if not specified.

This can be set in your `.env` file:

```env
VITE_API_URL=http://your-api-server.com
```
