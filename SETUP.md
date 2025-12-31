# Scheduler Application - Complete Setup Guide

This comprehensive guide will walk you through setting up the Scheduler application for development and production use.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Firebase Setup](#firebase-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Google Calendar Integration](#google-calendar-integration)
7. [Email Configuration](#email-configuration)
8. [Verification](#verification)
9. [Common Issues](#common-issues)
10. [Production Deployment](#production-deployment)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** 18 or higher
  ```bash
  node --version  # Should be v18.x.x or higher
  npm --version   # Should be 9.x.x or higher
  ```

- **Java** 17 or higher (JDK 21 recommended)
  ```bash
  java --version  # Should show version 17 or higher

  # macOS: Install via Homebrew
  brew install openjdk@21

  # Ubuntu/Debian
  sudo apt install openjdk-21-jdk

  # Verify JAVA_HOME is set
  echo $JAVA_HOME
  ```
  **Note:** The backend uses Java 21 compiler features. While Java 17 is the minimum, Java 21 is recommended for optimal compatibility.

- **PostgreSQL** 12+ database
  ```bash
  psql --version  # Should be 12.x or higher
  ```

- **Maven** 3.6+
  ```bash
  mvn --version   # Should be 3.6.x or higher
  ```

- **Git** for version control
  ```bash
  git --version
  ```

### Cloud Accounts (Free Tier Available)

- A [Firebase](https://firebase.google.com/) account (free tier sufficient)
- A [Google Cloud](https://console.cloud.google.com/) account for Calendar API (free tier)
- An SMTP email provider - **optional for development**
  - Gmail (free, requires App Password)
  - SendGrid (free tier: 100 emails/day)
  - Mailgun (free tier: 5000 emails/month)

## Database Setup

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create the Database

```bash
# Create the database
createdb scheduler_db

# Verify database creation
psql -l | grep scheduler_db
```

### 3. Set Database Password (if needed)

```bash
psql postgres
ALTER USER postgres PASSWORD 'your_password';
\q
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `scheduler-app` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Authentication Methods

1. In Firebase Console, navigate to **Build > Authentication**
2. Click **"Get started"**
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Enable **Google Sign-In**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"

### 3. Register Web App

1. In Firebase Console, click **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register app:
   - App nickname: `scheduler-web`
   - Don't check "Firebase Hosting"
   - Click "Register app"
5. **Copy the Firebase configuration** - you'll need this for the frontend

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXX",
  authDomain: "scheduler-app.firebaseapp.com",
  projectId: "scheduler-app",
  storageBucket: "scheduler-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Generate Service Account Key (for Backend)

1. In Firebase Console, go to **Project Settings > Service Accounts**
2. Click **"Generate new private key"**
3. Click **"Generate key"** - downloads a JSON file
4. **Save this file securely** as `firebase-service-account.json`
5. **IMPORTANT**: Never commit this file to version control!

## Backend Setup

### 1. Clone and Navigate

```bash
git clone https://github.com/rohit8008/scheduler.git
cd scheduler/scheduler-backend
```

### 2. Configure Application Properties

Copy the example configuration file and customize it:

```bash
# Copy the example file
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit the file with your actual credentials
# Use nano, vim, or your preferred editor
nano src/main/resources/application.properties
```

The configuration should include:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/scheduler_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Firebase Configuration
firebase.config.path=/absolute/path/to/firebase-service-account.json

# CORS Configuration
cors.allowed.origins=http://localhost:3000

# Email Configuration (Optional for development)
app.email.enabled=true
app.email.from=noreply@scheduler.app
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Google Calendar Configuration
google.client.id=your-google-client-id
google.client.secret=your-google-client-secret
```

### 3. Place Firebase Service Account File

Option A: Place in resources folder (not recommended for production)
```bash
cp /path/to/firebase-service-account.json src/main/resources/
# Add to .gitignore!
```

Option B: Place outside project (recommended)
```bash
# Update application.properties with absolute path
firebase.config.path=/Users/yourusername/secrets/firebase-service-account.json
```

### 4. Build and Run

```bash
# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Verify backend is running:**
```bash
curl http://localhost:8080/api/users
# Should return: []
```

## Frontend Setup

### 1. Navigate to Frontend

```bash
cd ../scheduler-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a new `.env.local` file in the `scheduler-frontend` directory:

```bash
# Create the environment file
touch .env.local
```

Or manually create the file and copy the template below.

### 4. Configure Environment Variables

Edit `.env.local` and add the following variables (replace with your actual values from Firebase setup):

```env
# Firebase Configuration (from Step 3 of Firebase Setup)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=scheduler-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=scheduler-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=scheduler-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Database Configuration (for Prisma)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/scheduler_db"

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Google Calendar (Optional - for client-side integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Database Migrations (if needed)

```bash
npx prisma migrate dev
```

### 7. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Google Calendar Integration

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project" > "New Project"**
3. Enter project name: `scheduler-calendar`
4. Click **"Create"**

### 2. Enable Google Calendar API

1. In the cloud console, go to **"APIs & Services" > "Library"**
2. Search for **"Google Calendar API"**
3. Click on it and click **"Enable"**

### 3. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User type: **External**
   - App name: `Scheduler`
   - Support email: your email
   - Developer contact: your email
   - Save and continue through all steps
4. Back in Credentials, click **"Create Credentials" > "OAuth client ID"**
5. Application type: **Web application**
6. Name: `Scheduler Web Client`
7. Authorized redirect URIs:
   - Add: `http://localhost:8080/api/google-calendar/callback`
   - Add: `http://localhost:3000/api/auth/google/callback`
8. Click **"Create"**
9. Copy **Client ID** and **Client Secret**

### 4. Add to Configuration

**Backend** (`application.properties`):
```properties
google.client.id=your-client-id.apps.googleusercontent.com
google.client.secret=your-client-secret
```

**Frontend** (`.env.local`):
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Email Configuration

### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Scroll to "App passwords"
   - Generate new app password for "Mail"
3. Use the generated password in `application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=generated-app-password
```

### Using SendGrid or Other SMTP

Update `application.properties` with your provider's settings:

```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=your-sendgrid-api-key
```

### Disable Email (for Development)

```properties
app.email.enabled=false
```

## Verification

### 1. Start Both Servers

**Terminal 1** - Backend:
```bash
cd scheduler-backend
mvn spring-boot:run
```

**Terminal 2** - Frontend:
```bash
cd scheduler-frontend
npm run dev
```

### 2. Test the Application

1. **Open browser**: Go to `http://localhost:3000`
2. **Landing page**: Should see professional landing page
3. **Sign up**: Click "Get Started" > "Sign Up"
4. **Create account**: Use email/password or Google Sign-In
5. **Check database**:
   ```bash
   psql scheduler_db
   SELECT * FROM "User";
   ```
6. **Create event**: Navigate to Events page and create a test event
7. **Set availability**: Go to Availability and set your schedule
8. **Test booking**: Visit your public profile at `/yourusername`

### 3. Check Logs

**Backend logs** should show:
- ✅ Firebase initialized successfully
- ✅ Database connection established
- ✅ Email service configured (if enabled)

**Frontend** should show no errors in browser console

## Common Issues

### Backend Won't Start

**Issue**: Port 8080 already in use
```bash
# macOS/Linux: Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Windows: Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Issue**: Database connection failed
```
Error: Connection to localhost:5432 refused
```
**Solutions:**
```bash
# Check if PostgreSQL is running
pg_isready

# macOS: Start PostgreSQL
brew services start postgresql

# Ubuntu/Debian: Start PostgreSQL
sudo service postgresql start

# Verify database exists
psql -l | grep scheduler_db

# If database doesn't exist, create it
createdb scheduler_db

# Test connection manually
psql -U postgres -d scheduler_db
```

**Issue**: Firebase initialization failed
```
Error: Failed to initialize Firebase Admin SDK
```
**Solutions:**
- Verify `firebase.config.path` in `application.properties` is an absolute path
- Check file exists: `ls -la /path/to/firebase-service-account.json`
- Verify JSON file is valid: `cat firebase-service-account.json | jq .`
- Ensure file has read permissions: `chmod 644 firebase-service-account.json`
- Check the file contains `project_id`, `private_key`, and `client_email` fields

**Issue**: Java version mismatch
```
Error: Unsupported class file major version 65
```
**Solutions:**
```bash
# Check Java version (need 17+, recommended 21)
java --version

# macOS: Set JAVA_HOME to Java 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Linux: Install Java 21
sudo apt install openjdk-21-jdk

# Verify Maven uses correct Java
mvn --version
```

**Issue**: Maven build fails
```
Error: Could not resolve dependencies
```
**Solutions:**
```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Rebuild with fresh dependencies
mvn clean install -U

# Skip tests if needed during development
mvn clean install -DskipTests
```

### Frontend Issues

**Issue**: Can't reach backend (CORS errors)
```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:3000'
has been blocked by CORS policy
```
**Solutions:**
- Verify backend is running: `curl http://localhost:8080/api/users`
- Check `NEXT_PUBLIC_API_URL=http://localhost:3000` in `.env.local`
- Verify `cors.allowed.origins=http://localhost:3000` in backend `application.properties`
- Restart both frontend and backend after changing CORS settings

**Issue**: Firebase authentication not working
```
Error: Firebase: Error (auth/invalid-api-key)
```
**Solutions:**
- Double-check all `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`
- Ensure no extra spaces or quotes in environment variables
- Verify Firebase config from Firebase Console > Project Settings > General
- Ensure Email/Password and Google Sign-In are enabled in Firebase Console > Authentication
- Clear browser cache and cookies: `Cmd+Shift+Delete` (macOS) or `Ctrl+Shift+Delete` (Windows)
- Try in incognito/private browsing mode
- Check browser console for detailed error messages

**Issue**: Prisma client errors
```
Error: PrismaClient is unable to be run in the browser
```
**Solutions:**
```bash
# Regenerate Prisma client
npx prisma generate

# If schema changed, push to database
npx prisma db push

# Reset database (⚠️ WARNING: This deletes all data!)
npx prisma migrate reset

# Verify Prisma can connect
npx prisma db pull
```

**Issue**: Module not found errors
```
Error: Cannot find module 'next' or its corresponding type declarations
```
**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install

# If still failing, clear npm cache
npm cache clean --force
npm install
```

**Issue**: Environment variables not loading
```
Error: process.env.NEXT_PUBLIC_API_URL is undefined
```
**Solutions:**
- Verify `.env.local` file exists in `scheduler-frontend` directory
- Ensure environment variables start with `NEXT_PUBLIC_` for client-side access
- Restart the dev server after changing `.env.local`
- Check file is named exactly `.env.local` (not `.env.local.txt`)

### Email Issues

**Issue**: Emails not sending
```
Error: 535-5.7.8 Username and Password not accepted
```
**Solutions:**
- For Gmail, ensure you're using an App Password (not your account password)
  1. Enable 2-Step Verification on Google Account
  2. Go to https://myaccount.google.com/apppasswords
  3. Generate new App Password for "Mail"
  4. Use this 16-character password in `application.properties`
- Check SMTP settings are correct:
  ```properties
  spring.mail.host=smtp.gmail.com
  spring.mail.port=587
  spring.mail.properties.mail.smtp.auth=true
  spring.mail.properties.mail.smtp.starttls.enable=true
  ```
- Temporarily disable email to test other features:
  ```properties
  app.email.enabled=false
  ```
- Check firewall isn't blocking ports 587 or 465
- Review backend logs for detailed SMTP errors

### Database/ORM Issues

**Issue**: Tables not created automatically
```
Error: Table "user" doesn't exist
```
**Solutions:**
- Ensure `spring.jpa.hibernate.ddl-auto=update` in `application.properties`
- Check database user has CREATE TABLE permissions
- Review backend startup logs for schema creation messages
- Manually create tables if needed (check entity classes for structure)

**Issue**: Connection pool exhausted
```
Error: Cannot get a connection, pool exhausted
```
**Solutions:**
```bash
# Restart backend application
mvn spring-boot:run

# Check PostgreSQL max connections
psql postgres
SHOW max_connections;
ALTER SYSTEM SET max_connections = 100;

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart   # Linux
```

### Google Calendar Issues

**Issue**: Calendar events not creating
```
Error: 401 Unauthorized
```
**Solutions:**
- Verify Google Calendar API is enabled in Google Cloud Console
- Check OAuth 2.0 credentials are correctly configured
- Ensure redirect URIs include `http://localhost:8080/api/google-calendar/callback`
- Verify `google.client.id` and `google.client.secret` in `application.properties`
- Re-authenticate with Google Calendar if credentials changed

### Port Conflicts

**Issue**: Multiple services failing to start

**Solutions:**
```bash
# Check what's running on each port
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # PostgreSQL

# Kill specific processes if needed
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

## Production Deployment

### Environment Preparation

1. **Database**: Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
2. **Firebase**: Add production domain to authorized domains
3. **Google Calendar**: Add production redirect URIs
4. **Email**: Use production SMTP service
5. **Environment Variables**: Set all secrets securely

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - All `NEXT_PUBLIC_*` variables
   - `DATABASE_URL`
4. Deploy

### Backend (Railway/Heroku)

1. Create new app
2. Add PostgreSQL addon
3. Set environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_USERNAME=...
   SPRING_DATASOURCE_PASSWORD=...
   FIREBASE_CONFIG_PATH=...
   CORS_ALLOWED_ORIGINS=https://your-domain.com
   ```
4. Deploy via Git or Docker
5. Configure Firebase service account (upload or use environment variable)

### Security Checklist

- [ ] All secrets stored in environment variables
- [ ] Firebase service account secured (never commit to Git)
- [ ] CORS configured for production domain only
- [ ] HTTPS enabled
- [ ] Database credentials rotated
- [ ] Email SMTP credentials secured
- [ ] Google Calendar credentials secured
- [ ] Production domain added to Firebase authorized domains

### Important Security Notes

**Never commit these files to version control:**
- `firebase-service-account.json`
- `.env.local` (frontend)
- `.env` (any environment)
- `application.properties` with real credentials

**The `.gitignore` file already includes:**
```
.env
.env.local
.env.*.local
```

**Best practices:**
1. Use environment variables for all secrets in production
2. Store Firebase service account JSON in secure cloud storage (AWS Secrets Manager, etc.)
3. Rotate credentials regularly
4. Use different credentials for development, staging, and production
5. Enable 2FA on all cloud accounts (Firebase, Google Cloud, etc.)

## Docker Setup (Optional)

For containerized deployment, you can use Docker:

### Backend Dockerfile

Create `scheduler-backend/Dockerfile`:
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

Create `scheduler-frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: scheduler_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./scheduler-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/scheduler_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    depends_on:
      - postgres

  frontend:
    build: ./scheduler-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Run with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Next Steps

1. **Customize**: Update branding, colors, and content
2. **Test**: Thoroughly test all features
3. **Monitor**: Set up logging and monitoring
4. **Backup**: Configure database backups
5. **Domain**: Configure custom domain
6. **SSL**: Ensure HTTPS is enabled
7. **Analytics**: Add analytics tracking (optional)

## Support

For issues during setup:
- Check the [main README](./README.md) for architecture details
- Review error logs in backend console
- Check browser console for frontend errors
- Verify all environment variables are set
- Ensure all services are running

Still having issues? Open an issue on [GitHub](https://github.com/rohit8008/scheduler/issues)

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Setup completed? You're ready to start using Scheduler! 🎉**
