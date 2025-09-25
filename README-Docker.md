# Kazenites - Docker Setup

A modern marketplace application with Spring Boot backend and React Native frontend.

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd Kazenites

# Copy environment template
cp .env.example .env
```

### 2. Launch Everything
```bash
# Start all services (MySQL, Backend, Frontend)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

This will start:
- **MySQL**: `localhost:3307`
- **Backend API**: `localhost:8080`
- **Frontend Metro**: `localhost:8081`

### 3. Test the Setup
```bash
# Check backend health
curl http://localhost:8080/api/health

# Check services status
docker-compose ps
```

### 4. Mobile Development

For **React Native mobile development**, you still need to run the app on a device/simulator:

#### Android
```bash
# Terminal 1: Keep Docker services running
docker-compose up

# Terminal 2: Run React Native
cd Kazenites-frontend
npm install
npm run android
```

#### iOS
```bash
# Terminal 1: Keep Docker services running
docker-compose up

# Terminal 2: Run React Native
cd Kazenites-frontend
npm install
cd ios && pod install && cd ..
npm run ios
```

The mobile apps will connect to the backend running in Docker at `localhost:8080`.

## Manual Development Setup

If you prefer running without Docker:

### Backend
```bash
cd Kazenites-backend

# Start MySQL locally first
mysql -u root -p
CREATE DATABASE kazenitesdb;

# Run Spring Boot
./gradlew bootRun
```

### Frontend
```bash
cd Kazenites-frontend
npm install
npm start

# In another terminal
npm run android  # or npm run ios
```

## Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Reset database
docker-compose down -v
docker-compose up --build
```

## Environment Variables

Edit `.env` file to customize:

```bash
APP_JWT_SECRET=your-super-secret-jwt-key
MYSQL_ROOT_PASSWORD=12345678
MYSQL_DATABASE=kazenitesdb
MYSQL_USER=kazenites
MYSQL_PASSWORD=kazenites123
```

## API Endpoints

With Docker running:

- **Health**: `GET http://localhost:8080/api/health`
- **Register**: `POST http://localhost:8080/api/auth/register`
- **Login**: `POST http://localhost:8080/api/auth/login`
- **Listings**: `GET http://localhost:8080/api/listings`

## Troubleshooting

### Port Conflicts
If ports are in use, edit `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Change backend to 8081
  - "3308:3306"  # Change MySQL to 3308
```

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose ps mysql

# Reset database
docker-compose down mysql
docker volume rm kazenites_mysql_data
docker-compose up mysql
```

### Mobile App Can't Connect
1. Check backend is accessible: `curl http://localhost:8080/api/health`
2. For physical devices, use your computer's IP in `src/config.ts`:
   ```typescript
   return 'http://192.168.1.100:8080';  // Your computer's IP
   ```

## Production Deployment

### Build Production Images
```bash
# Build optimized backend
docker build -t kazenites-backend ./Kazenites-backend

# For mobile, build APK/IPA separately
cd Kazenites-frontend
npm run build:android  # Generates APK
npm run build:ios      # Generates IPA
```

### Environment Security
For production, update `.env`:
```bash
APP_JWT_SECRET=generate-a-strong-secret-here
MYSQL_ROOT_PASSWORD=strong-password
MYSQL_PASSWORD=another-strong-password
```

## Team Onboarding

New team members only need:
1. Install Docker
2. Clone repo
3. Run `docker-compose up --build`
4. Install Node.js 20+ for mobile development

No more "works on my machine" issues! 🚀