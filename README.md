# RoadFix AI 🚧

A full-stack road damage reporting and management system built with React, Node.js, and MySQL. Citizens can report road damage with AI-powered analysis, and municipal officers can manage and track repairs.

## Features

- **AI Damage Detection** — Auto-detects damage type, severity, and repair estimates from uploaded images
- **Role-based Access** — Citizen, Municipal Member, and Admin roles
- **Email Notifications** — Citizens get notified at every status update via Gmail
- **Sequential Workflow** — Approve → Assign → Start Work → Resolved → Close
- **PDF Export** — Municipal officers can export detailed reports with damage images
- **Track Complaints** — Citizens can track all their complaints with a live status timeline
- **Karnataka Location System** — District/city/ward selection for Karnataka, India

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, pure CSS |
| Backend | Node.js, Express |
| Database | MySQL (via XAMPP) |
| Auth | JWT + bcrypt |
| Email | Nodemailer + Gmail |
| PDF | jsPDF |
| AI | Google Gemini API |

## Project Structure

```
RoadFixAi/
├── backend/          # Express API server
│   ├── config/       # Database config
│   ├── middleware/   # JWT auth middleware
│   ├── models/       # Sequelize models (User, Report)
│   ├── routes/       # API routes (auth, reports, users)
│   ├── services/     # Email service
│   └── server.js     # Entry point
└── frontend/         # React app
    └── src/
        ├── components/
        ├── context/  # Auth context
        ├── pages/    # All page components
        └── data/     # Karnataka location data
```

## Getting Started

### Prerequisites
- Node.js v18+
- XAMPP (MySQL)
- Gmail account with App Password

### 1. Clone the repo
```bash
git clone https://github.com/Shubham27082/RoadFixAi.git
cd RoadFixAi
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (DB, JWT secret, Gmail credentials)
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Database
- Start XAMPP and enable MySQL
- The server auto-creates tables on first run via Sequelize sync

## Environment Variables

Create `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=road_damage_db
JWT_SECRET=your_jwt_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_gemini_key
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roadfix.com | admin123 |
| Municipal | testmunicipal@example.com | municipal123 |
| Citizen | testcitizen@example.com | password123 |

## License

MIT
