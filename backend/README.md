# Road Damage Backend API

A Node.js backend API for the Road Damage Reporting System with email verification, JWT authentication, and MongoDB integration.

## Features

- ✅ User registration with email verification
- ✅ JWT-based authentication
- ✅ Email service with HTML templates
- ✅ MongoDB integration with Mongoose
- ✅ Input validation and sanitization
- ✅ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Role-based access control
- 🔄 File upload support (Coming soon)
- 🔄 Report management (Coming soon)

## Prerequisites

- Node.js (v14 or higher)
- XAMPP with MySQL (or standalone MySQL)
- Gmail account for email service (or other SMTP provider)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - MySQL database credentials
   - JWT secret key
   - **Email service credentials (REQUIRED for verification emails)**
   - Frontend URL
   
   **Important:** Email configuration is required for user registration to work. See `email-setup-guide.md` for detailed setup instructions.

3. **Start XAMPP MySQL:**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services
   - Create database using `setup-mysql.sql`

4. **Configure Email Service:**
   ```bash
   # Test your email configuration
   node test-email.js
   ```
   
   Follow the instructions in `email-setup-guide.md` to set up Gmail or another email provider.

5. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/verify-email` | Verify email with 6-digit code | Public |
| POST | `/resend-verification` | Resend verification email | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user profile | Private |
| POST | `/logout` | User logout | Private |

### Registration Flow

1. **Register User** (`POST /api/auth/register`)
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "phone": "+1234567890",
     "password": "password123",
     "confirmPassword": "password123",
     "ward": "Ward 1 - Downtown",
     "userType": "citizen"
   }
   ```

2. **Verify Email** (`POST /api/auth/verify-email`)
   ```json
   {
     "email": "john@example.com",
     "verificationCode": "123456"
   }
   ```

3. **Login** (`POST /api/auth/login`)
   ```json
   {
     "email": "john@example.com",
     "password": "password123",
     "userType": "citizen"
   }
   ```

## Email Templates

The system includes beautiful HTML email templates for:

- **Verification Email**: 6-digit code with branding
- **Welcome Email**: Post-verification welcome message
- **Password Reset**: Security-focused reset instructions

## Database Schema

### User Model
- Personal information (name, email, phone)
- Authentication (password, verification status)
- Role-based access (citizen, municipal, admin)
- Ward assignment for location-based features

### Report Model (Coming Soon)
- Damage reporting with AI analysis
- Location tracking with GPS coordinates
- Status management and workflow
- File attachments and images

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator sanitization
- **Rate Limiting**: Prevent abuse and spam
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: HTTP security headers

## Development

### Project Structure
```
road-damage-backend/
├── models/           # Database models
├── routes/           # API route handlers
├── middleware/       # Custom middleware
├── services/         # Business logic services
├── uploads/          # File upload directory
├── .env             # Environment variables
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `road_damage_db` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | `` (empty for XAMPP) |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `EMAIL_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP password | `your-app-password` |
| `FRONTEND_URL` | Frontend domain | `http://localhost:5173` |

### Testing the API

1. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register User:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","password":"password123","confirmPassword":"password123","ward":"Ward 1 - Downtown","userType":"citizen"}'
   ```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Other SMTP Providers
Update the email configuration in `.env`:
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production database
   - Set up proper email service

2. **Security Considerations:**
   - Use HTTPS in production
   - Configure proper CORS origins
   - Set up monitoring and logging
   - Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.