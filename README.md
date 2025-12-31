# Scheduler - Professional Meeting Scheduling Application

A modern, full-stack meeting scheduling application built with Next.js 15 and Spring Boot 3, featuring Firebase Authentication, Google Calendar integration, and automated email notifications.

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen?logo=springboot)
![Java](https://img.shields.io/badge/Java-17%2B-orange?logo=openjdk)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue?logo=postgresql)
![Firebase](https://img.shields.io/badge/Firebase-10.7-orange?logo=firebase)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
  - [Docker Setup (Recommended)](#option-1-docker-recommended-for-quick-setup-)
  - [Manual Setup](#option-2-manual-setup)
- [Key Pages & Features](#key-pages--features)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Security](#security-features)
- [Contributing](#contributing)

## Features

### Core Functionality
- **Smart Scheduling**: Create public and private events with customizable durations
- **Availability Management**: Set weekly availability with specific time blocks
- **Direct Booking**: Users can request meetings directly from your availability
- **Automatic Confirmation**: Meetings are automatically approved and scheduled
- **Public Profile Pages**: Share your scheduling page via custom username URL

### Authentication & Security
- **Firebase Authentication**: Secure authentication with email/password and Google Sign-In
- **Protected Routes**: Client-side and server-side route protection
- **JWT Token Verification**: Firebase Admin SDK integration for secure API access
- **Spring Security**: Enterprise-grade authorization and CORS configuration

### Calendar & Email Integration
- **Google Calendar Sync**: Automatic calendar event creation
- **Email Notifications**: Automated emails with calendar invites (.ics)
- **Meet Link Generation**: Google Meet links included in all bookings
- **Conflict Detection**: Smart availability checking prevents double-booking

### User Experience
- **Professional UI**: Modern, responsive design with Tailwind CSS
- **Public Event Sharing**: Shareable links for both public and private events
- **Meeting Requests**: Simple form-based booking from availability
- **Real-time Updates**: Instant feedback and loading states
- **Mobile Responsive**: Optimized for all screen sizes

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with server components
- **Firebase 10** - Authentication and real-time features
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Prisma** - Type-safe database client
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Spring Boot 3.2** - Enterprise Java framework
- **Spring Security** - Authentication & authorization
- **Firebase Admin SDK** - Token verification
- **Spring Data JPA** - Object-relational mapping
- **PostgreSQL** - Production-grade database
- **Google Calendar API** - Calendar integration
- **Spring Mail** - Email service with Thymeleaf templates
- **Maven** - Dependency management

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend - Next.js 15 (Port 3000)                  │
│  ├─ Pages (App Router)                              │
│  ├─ Components (React 19)                           │
│  ├─ Firebase Auth                                    │
│  └─ Prisma Client                                    │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (JWT Auth)
┌─────────────────────┴───────────────────────────────┐
│  Backend - Spring Boot 3 (Port 8080)                │
│  ├─ Controllers (REST API)                          │
│  ├─ Services (Business Logic)                       │
│  ├─ Repositories (Data Access)                      │
│  ├─ Firebase Admin (Token Verification)             │
│  ├─ Google Calendar Integration                     │
│  └─ Email Service (SMTP + Thymeleaf)                │
└─────────────────────┬───────────────────────────────┘
                      │ JPA/Hibernate
┌─────────────────────┴───────────────────────────────┐
│  PostgreSQL Database (Port 5432)                    │
│  ├─ User (Authentication data)                      │
│  ├─ Event (Scheduling events)                       │
│  ├─ Booking (Meeting bookings)                      │
│  ├─ Availability (User availability)                │
│  └─ DayAvailability (Weekly schedule)               │
└─────────────────────────────────────────────────────┘
```

## Quick Start

### Two Setup Options

#### Option 1: Docker (Recommended for Quick Setup) 🐳

The fastest way to get started with minimal setup:

```bash
# 1. Clone the repository
git clone https://github.com/rohit8008/scheduler.git
cd scheduler

# 2. Set up environment variables
cp .env.docker.example .env
# Edit .env with your Firebase credentials

# 3. Add Firebase service account
# Place firebase-service-account.json in the root directory

# 4. Run the startup script
./docker-start.sh  # macOS/Linux
# OR
.\docker-start.ps1  # Windows

# The script will build and start all services automatically!
```

Or manually with Docker Compose:
```bash
docker-compose up -d
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080

**Requirements:** Docker 20.10+ and Docker Compose 2.0+

📖 **[See complete Docker setup guide →](./DOCKER.md)**

#### Option 2: Manual Setup

For development or if you prefer running services individually:

**Prerequisites:**
- Node.js 18+
- Java 17+ (Java 21 recommended)
- PostgreSQL 12+
- Maven 3.6+
- Firebase project

**Installation:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohit8008/scheduler.git
   cd scheduler
   ```

2. **Set up the database**
   ```bash
   createdb scheduler_db
   ```

3. **Configure Firebase** (See [SETUP.md](./SETUP.md) for details)
   - Create Firebase project
   - Enable Email/Password and Google authentication
   - Generate service account key

4. **Configure the backend**
   ```bash
   cd scheduler-backend
   # Copy example configuration and update with your values
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   # Edit application.properties with your database and Firebase settings
   ```

5. **Start the backend**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

6. **Configure the frontend**
   ```bash
   cd ../scheduler-frontend
   # Copy example environment file and update with your values
   cp .env.example .env.local
   # Edit .env.local with your Firebase and API settings
   ```

7. **Start the frontend**
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## Key Pages & Features

### Landing Page (/)
- Professional hero section with statistics
- Feature showcase
- Testimonials
- How it works section
- Redirects to login for unauthenticated users
- Auto-redirects to dashboard for logged-in users

### Dashboard (/dashboard)
- Welcome message with user name
- Quick stats cards (meetings, events, profile link)
- Upcoming meetings overview
- Unique profile link manager

### Events (/events)
- Create new events (public/private)
- Manage existing events
- Copy shareable links
- View booking counts
- Delete events

### Meetings (/meetings)
- View upcoming meetings
- See past meetings
- Cancel/reschedule options
- Meeting details with Google Meet links

### Availability (/availability)
- Set weekly availability schedule
- Define time blocks for each day
- Configure minimum gap between meetings
- Real-time availability preview

### Public Profile (/:username)
- Professional user profile page
- Display public events
- Show weekly availability
- Request meeting form
- Event booking interface

### Event Booking (/:username/:eventId)
- Event details display
- Available time slot selection
- Booking form
- Automated confirmation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users/firebase/{uid}` - Get user by Firebase UID
- `PUT /api/users/{id}` - Update user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/{id}` - Get event details
- `GET /api/events/user/{userId}` - Get user events
- `GET /api/events/user/{userId}/public` - Get public events only
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get booking details
- `GET /api/bookings/user/{userId}` - Get user bookings
- `GET /api/bookings/event/{eventId}` - Get event bookings
- `POST /api/bookings` - Create booking (auto-approved)
- `DELETE /api/bookings/{id}` - Cancel booking

### Availability
- `GET /api/availability/user/{userId}` - Get user availability
- `POST /api/availability` - Set availability
- `PUT /api/availability/{id}` - Update availability

## Email Notifications

All bookings automatically trigger email notifications:

**To Attendee:**
- Booking confirmation
- Event details (title, date, time, duration)
- Host information
- Google Meet link
- Calendar invitation (.ics attachment)
- Host contact email

**To Host:**
- New booking notification
- Attendee details
- Meeting information
- Google Meet link

## Environment Variables

### Frontend (.env.local)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/scheduler_db"

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/scheduler_db
spring.datasource.username=postgres
spring.datasource.password=yourpassword

# Firebase
firebase.config.path=/path/to/service-account.json

# Email (Optional)
app.email.from=noreply@scheduler.app
app.email.enabled=true
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# CORS
cors.allowed.origins=http://localhost:3000
```

## Deployment

### Production Checklist
- [ ] Set up production PostgreSQL database
- [ ] Configure Firebase for production domain
- [ ] Set up email SMTP credentials
- [ ] Configure Google Calendar API for production
- [ ] Update CORS settings
- [ ] Set all environment variables
- [ ] Test authentication flow
- [ ] Test booking and email notifications
- [ ] Verify calendar integration

### Frontend (Vercel)
1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Backend (Railway/Heroku/AWS)
1. Set up PostgreSQL addon
2. Configure environment variables
3. Deploy via Docker or Maven package

## Development

```bash
# Terminal 1 - Backend
cd scheduler-backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd scheduler-frontend
npm run dev
```

## Testing

```bash
# Backend tests
cd scheduler-backend
mvn test

# Frontend tests (when available)
cd scheduler-frontend
npm test
```

## Security Features

- Firebase JWT authentication
- Spring Security authorization
- Protected API endpoints
- CORS configuration
- Secure password handling
- Token-based API access
- Input validation (Zod schemas)
- SQL injection protection (JPA)
- XSS protection (React)

## Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9
```

**Database connection failed:**
```bash
# Check if PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep scheduler_db

# Check credentials in application.properties
```

**Firebase initialization error:**
- Verify `firebase.config.path` points to the correct JSON file
- Ensure the service account file has proper read permissions
- Check that the JSON file is valid (not corrupted)

**Java version mismatch:**
```bash
# Check Java version (requires 17+)
java --version

# If using multiple Java versions, set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Frontend Issues

**CORS errors when calling backend:**
- Verify backend is running on http://localhost:8080
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure `cors.allowed.origins` includes http://localhost:3000 in backend config

**Firebase authentication not working:**
- Double-check all `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`
- Ensure Email/Password and Google Sign-In are enabled in Firebase Console
- Clear browser cache and cookies
- Check browser console for detailed error messages

**Prisma errors:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Email Issues

**Emails not sending:**
- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password (not your account password)
- Check firewall settings aren't blocking SMTP ports (587/465)
- Set `app.email.enabled=false` to disable emails during development
- Review backend logs for detailed error messages

### Database Issues

**Tables not created:**
- Ensure `spring.jpa.hibernate.ddl-auto=update` in application.properties
- Check database user has CREATE permissions
- Review backend startup logs for schema creation

**Connection pool exhausted:**
- Restart the backend application
- Check for unclosed database connections in code
- Verify PostgreSQL max_connections setting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Documentation

- **[Docker Setup Guide](./DOCKER.md)** - Quick setup using Docker (Recommended)
- **[Setup Guide](./SETUP.md)** - Complete manual installation and configuration
- [Backend README](./scheduler-backend/README.md) - Backend API documentation
- [Frontend README](./scheduler-frontend/README.md) - Frontend documentation

## License

MIT License - see [LICENSE](LICENSE) for details

## Author

**Rohit Mittal**
- Email: mittalrohit701@gmail.com
- GitHub: [@rohit8008](https://github.com/rohit8008)

## Support

For issues and questions:
- [GitHub Issues](https://github.com/rohit8008/scheduler/issues)
- Email: mittalrohit701@gmail.com

---

**Built with ❤️ using Spring Boot, Next.js, and Firebase**
