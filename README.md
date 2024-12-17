# Email Summarizer

An application that uses AI to automatically summarize emails from your inbox.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: Google OAuth 2.0
- AI: OpenAI/Claude API
- Hosting: Vercel (frontend) + Render (backend) + MongoDB Atlas

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/email-summarizer.git
cd email-summarizer
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
cp .env.example .env
# Fill in your environment variables

# Frontend (.env)
cp .env.example .env
# Fill in your environment variables
```

4. Start development servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Deployment

### Frontend (Vercel)
- Connect your GitHub repository to Vercel
- Set environment variables in Vercel dashboard
- Deploy

### Backend (Render)
- Connect your GitHub repository to Render
- Create a Web Service
- Set environment variables
- Deploy

## Environment Variables

### Backend
```plaintext
PORT=3001
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
FRONTEND_URL=your_frontend_url
```

### Frontend
```plaintext
VITE_API_URL=your_backend_url
```

## Features

- Google OAuth authentication
- Email fetching from Gmail
- AI-powered email summarization
- Email organization and search
- Starred emails
- Mobile-responsive design