# AI Chat - Kali OS Learning Assistant

A ChatGPT-like AI chat application built specifically for learning hacking commands and Kali OS. The application features a clean interface with system prompt configuration and chat functionality powered by Google's Gemini API.

## Features

### Frontend (React 19 + Tailwind CSS)
- System prompt input at the top for setting AI context
- ChatGPT-like chat interface with user/AI message bubbles
- Scrollable chat history
- Copy message functionality
- Reset chat option
- Responsive design with dark theme

### Backend (FastAPI + PostgreSQL)
- RESTful API endpoints for chat functionality
- Google Gemini API integration for AI responses
- PostgreSQL database for chat history and session storage
- CORS enabled for frontend integration
- Session-based chat management

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database
- Google Gemini API key

### 1. Database Setup
Create a PostgreSQL database named `aichat`:
```sql
CREATE DATABASE aichat;
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your configuration:
# - DATABASE_URL: Your PostgreSQL connection string
# - GEMINI_API_KEY: Your Google Gemini API key
# - SECRET_KEY: A secure secret key

# Run the server
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/{session_id}` - Get chat history
- `POST /api/chat/{session_id}/reset` - Reset chat history
- `POST /api/chat/{session_id}/system-prompt` - Update system prompt
- `GET /api/sessions` - Get all session IDs

## Usage

1. Open the application in your browser
2. Set a system prompt (e.g., "Teach me hacking commands for Kali OS")
3. Start chatting with the AI about cybersecurity topics
4. Use the copy button to copy AI responses
5. Use the reset button to clear chat history

## Configuration

### Environment Variables (Backend)
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `SECRET_KEY`: Secret key for the application

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add the key to your `.env` file

## Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main chat component
│   │   ├── App.css          # Styles
│   │   └── main.jsx         # Entry point
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── core/            # Database and config
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── main.py              # FastAPI app
│   └── requirements.txt
└── README.md
```

## Technologies Used

- **Frontend**: React 19, Tailwind CSS, Vite
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **AI**: Google Gemini API
- **Database**: PostgreSQL