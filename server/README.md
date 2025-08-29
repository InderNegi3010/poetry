# Bahr Checker Backend API

A Node.js/Express API for analyzing poetry text and checking Bahr patterns in Hindi and Hinglish.

## Features

- **Language Detection**: Automatically detects Devanagari (Hindi) and Hinglish text
- **Poetry Analysis**: Analyzes poetry for Bahr patterns using specialized analyzers
- **Database Storage**: Stores analysis results in MongoDB
- **RESTful API**: Clean REST endpoints for frontend integration
- **ES Modules**: Modern JavaScript with ES module syntax

## Project Structure

```
server/
├── analyzers/          # Poetry analysis logic
│   ├── HindiAnalyzer.js
│   └── HinglishAnalyzer.js
├── config/             # Configuration files
│   └── database.js
├── models/             # MongoDB schemas
│   └── Analysis.js
├── routes/             # API route handlers
│   ├── analysis.js
│   └── health.js
├── utils/              # Utility functions
│   └── languageDetector.js
├── .env.example        # Environment variables template
├── package.json
└── server.js           # Main application entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/check-bahr
Analyze poetry text for Bahr patterns.

**Request Body:**
```json
{
  "text": "Your poetry text here"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Great! Your poetry is in Bahr. Keep up the good work.",
  "bahrType": "मुज्तस मुसम्मन मख़बून महज़ूफ़ मस्कन",
  "pattern": ["1212", "1122", "1212", "22"],
  "highlightedLine": null
}
```

### GET /api/analyses
Get stored analysis results with pagination.

**Query Parameters:**
- `limit` (default: 100) - Number of results per page
- `page` (default: 1) - Page number

### GET /api/health
Health check endpoint.

### GET /
API documentation and available endpoints.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `NODE_ENV` - Environment (development/production)

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **ES Modules** - Modern JavaScript modules
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
