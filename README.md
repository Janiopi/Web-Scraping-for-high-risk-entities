# Web Scraping for High-Risk Entities

A comprehensive web application for searching and analyzing high-risk entities across multiple financial databases including Offshore Leaks, OFAC Sanctions List, and World Bank Debarment database. Built with a js tech stack featuring JWT authentication, MongoDB integration, and a responsive web interface.

## Index

- [Key Features](#key-features)
- [Project structure](#project-structure)
- [ Stack ](#technology-stack)
- [ Architecture ](#architecture-overview)
- [ Auth System](#authentication-system)
- [Database](#database-design)
- [ API endpoints ](#api-documentation)
- [ Deployment ](#deployment)

## Key Features

- **Multi-Source Scraping**: Search across Offshore Leaks, OFAC, and World Bank databases simultaneously
- **MVC Architecture**: Clean separation of concerns following Model-View-Controller pattern
- **MongoDB Integration**: Persistent user management and audit trails
- **JWT Authentication**: Secure user authentication with token blacklisting for secure logout
- **Real-time Search**: Interactive search interface with collapsible results by source
- **Data Export**: Download search results in JSON format with metadata (From frontend)
- **Responsive Design**: Modern UI built with Tailwind CSS and Font Awesome icons

## Project Structure

```
Web-Scraping-for-high-risk-entities/
├── backend/                          # Node.js/Express API Server
│   ├── src/
│   │   ├── controllers/              # Business logic layer
│   │   │   ├── authController.js     # Authentication endpoints
│   │   │   └── searchController.js   # Search endpoints
│   │   ├── middleware/               # Express middleware
│   │   │   └── authMiddleware.js     # JWT token validation
│   │   ├── models/                   # MongoDB data models
│   │   │   ├── User.js               # User schema with authentication
│   │   │   └── BlacklistedToken.js   # Token blacklisting for secure logout
│   │   ├── routes/                   # API route definitions
│   │   │   ├── api.js                # Search route
│   │   │   └── auth.js               # Authentication routes
│   │   ├── services/                 # Service layer (data access)
│   │   │   ├── databaseService.js    # Database operations
│   │   │   ├── searchService.js      # Search orchestration
│   │   │   └── scrapers/             # Web scraping modules
│   │   │       ├── offshoreLeaks.js  # Offshore Leaks scraper
│   │   │       ├── ofac.js           # OFAC sanctions scraper
│   │   │       └── theWorldBank.js   # World Bank scraper
│   │   └── app.js                    # Express application setup
│   ├── package.json                  # Backend dependencies
│   ├── .env.development              # Development environment variables
│   └── .env.production               # Production environment variables
├── frontend/                         # Vite-powered frontend
│   ├── src/
│   │   ├── components/               # UI components
│   │   │   ├── AppComponent.js       # Main application component
│   │   │   ├── AuthComponent.js      # Login/Register interface
│   │   │   ├── DashboardComponent.js # User dashboard
│   │   │   └── SearchComponent.js    # Search interface with collapsible results
│   │   ├── services/                 # Frontend services
│   │   │   ├── apiService.js         # HTTP client for backend communication
│   │   │   └── authService.js        # Authentication state management
│   │   └── main.js                   # Application entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite configuration
├── start-dev.sh                      # Development startup script
├── AUTH_GUIDE.md                     # Authentication implementation guide
├── DATABASE_INTEGRATION_GUIDE.md     # Database setup guide
├── MVC_PATTERN_GUIDE.md              # Architecture pattern documentation
└── README.md                         # This file
```

## Technology Stack

### Backend

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Web Scraping**: Puppeteer for browser automation
- **Validation**: express-validator
- **Environment**: dotenv for configuration management

### Frontend

- **Build Tool**: Vite 5.0.0
- **JavaScript**: Vanilla ES6+ with modules
- **HTTP Client**: Axios for API communication
- **Styling**: Tailwind CSS 2.2.19
- **Icons**: Font Awesome 6.0.0
- **Architecture**: Component-based with service layer

### Development Tools

- **Package Manager**: npm
- **Process Manager**: nodemon for development
- **Environment**: Separate development/production configs

## Architecture Overview

![architecture](screenshots/diagram-export-10-28-2025-5_09_40-PM.png)

### MVC Pattern Implementation

The backend follows a strict Model-View-Controller (MVC) architecture:

#### **Models** (`/models/`)

- **User.js**: MongoDB schema for user data with authentication features
  - Password hashing with bcryptjs
  - User roles and permissions
  - Audit fields (createdAt, updatedAt)
- **BlacklistedToken.js**: Token management for secure logout

#### **Views** (Frontend Components)

- **AuthComponent**: Login/registration interface
- **DashboardComponent**: User dashboard with statistics
- **SearchComponent**: Interactive search with collapsible results
- **AppComponent**: Main application shell with routing

#### **Controllers** (`/controllers/`)

- **authController.js**: Authentication business logic
  - User registration and login
  - Token generation and validation
  - Secure logout with token blacklisting
- **searchController.js**: Search orchestration
  - Multi-source search coordination

#### **Services** (`/services/`)

- **databaseService.js**: Data access layer
  - User CRUD operations
  - Token blacklist management
  - Database connection handling
- **searchService.js**: Search coordination
- **Scrapers**: Individual scraping modules for each data source

## Authentication System

#### JWT Implementation

- **Token Generation**: Secure JWT tokens with configurable expiration
- **Token Validation**: Middleware-based authentication for protected routes
- **Secure Logout**: Token blacklisting prevents reuse of invalidated tokens
- **Password Security**: bcryptjs hashing with salt rounds

#### Security Features

- **Password Hashing**: All passwords stored as bcrypt hashes
- **Token Blacklisting**: Prevents replay attacks on logged-out sessions
- **Input Validation**: express-validator for request sanitization
- **CORS Configuration**: Controlled cross-origin access

## Database Design

#### MongoDB Collections

1. **users**: User accounts with authentication data
2. **blacklistedtokens**: Invalidated JWT tokens

#### Key Features

- **Mongoose ODM**: Schema validation and middleware
- **Automatic Indexing**: Optimized queries for performance
- **TTL Indexes**: Auto-cleanup of expired tokens

## Web Scraping Implementation

### Supported Data Sources

1. **Offshore Leaks Database**

   - Source: [ICIJ (International Consortium of Investigative Journalists)](https://sanctionssearch.ofac.treas.gov/)
   - Data: Offshore entities, shell companies, tax havens
   - Not working on production :(

2. **OFAC Sanctions List**

   - Source: [U.S. Treasury Department](https://sanctionssearch.ofac.treas.gov/)
   - Data: Sanctioned individuals and entities

3. **World Bank Debarment**
   - Source: [World Bank Group](https://projects.worldbank.org/en/projects-operations/procurement/debarred-firms)
   - Data: Debarred firms and individuals

### Scraper Architecture

- **Puppeteer Integration**: Headless browser automation
- **Concurrent Execution**: Searches across all sources
- **Error Handling**: Graceful degradation when sources are unavailable
- **Result Standardization**: Unified data format across all sources

## API Documentation

### Authentication Endpoints

```
POST /auth/register    # User registration
POST /auth/login       # User authentication
POST /auth/logout      # Secure logout with token blacklisting
GET  /auth/profile     # Get user profile (protected)
GET  /auth/verify      # Verify token validity
GET  /auth/stats       # Admin statistics (admin only)
```

### Search Endpoints

```
GET  /api/health                                # Service health check
POST /api/search?entityName={'Source',...}       # Multi-source entity search (protected)
GET /api/sources                                # Get all available sources
```

## Postman collection

In this collection we are testing all endpoints of the API (be sure that the Render service is active)

[Link to postman collection](https://janio-zapata-i-9718111.postman.co/workspace/JANIO-ADOLFO-ZAPATA-INGA's-Work~fbad851b-ad7f-4069-884d-4e10c07faced/collection/49559486-3bc0bcb9-f560-4bf6-b764-0c0efc3bb7de?action=share&creator=49559486&active-environment=49559486-8e130579-ee57-4178-9ecd-f25cb387538f)

### Request/Response Examples

### Register request

![alt text](screenshots/image.png)
![alt text](screenshots/image-1.png)

### Register response

![alt text](screenshots/image-2.png)

#### Search Request

![alt text](screenshots/image-3.png)

#### Search Response

![alt text](screenshots/image-4.png)

## Frontend Features

### Search Interface

- **Real-time Search**: Interactive search with loading indicators
- **Collapsible Results**: Toggle visibility by data source
- **Result Export**: Download search results as JSON with metadata
- **Status Feedback**: Success/error messages with auto-hide

### User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Enhancement**: Works without JavaScript (basic functionality)
- **Performance**: Optimized with Vite build system

### Component Architecture

- **Modular Design**: Reusable components with clear separation
- **Service Layer**: Centralized API communication
- **State Management**: Local component state with service coordination

# Deployment

## Production Deployment

There are two services deployed

- [Backend](https://web-scraping-for-high-risk-entities-lwp7.onrender.com/health): Deployed on Render. Since its a free service, sometimes due inactivity enter in "sleep" mode.

- Database: This is delpoyed on MongoDB Atlas. This is the connection string (Due obvious reasons there is no user/password):

`   mongodb+srv://<db_user>:<db_password>@cluster0.b5tat5p.mongodb.net/?appName=Cluster0`

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm (v8 or higher)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/Janiopi/Web-Scraping-for-high-risk-entities.git
   cd Web-Scraping-for-high-risk-entities
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Set up MongoDB**

   ```bash
   # Start MongoDB service (varies by OS)
   # Ubuntu/Debian:
   sudo systemctl start mongod

   # macOS with Homebrew:
   brew services start mongodb-community

   # Windows: Start MongoDB as a service
   ```

4. **Configure environment variables**

   ```bash
   # Backend environment is already configured for development
   # Default configuration uses:
   # - Port: 3000
   # - MongoDB: mongodb://localhost:27017/web-scraping-auth
   # - JWT Secret: dev-secret-key-change-in-production-2024
   ```

5. **Start the application**

   ### Terminal 1 - Backend

   ```bash
    cd backend && npm run dev
   ```

   ### Terminal 2 - Frontend

   ```bash
    cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/api/health

### Default Admin User

The system automatically creates a default admin user:

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: administrator

## Docker Deployment

#### Prerequisites for Docker

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

#### Quick Docker Setup

1. **Clone and navigate to the project**

   ```bash
   git clone https://github.com/Janiopi/Web-Scraping-for-high-risk-entities.git
   cd Web-Scraping-for-high-risk-entities
   ```

2. **Build and start with Docker Compose**

   ```bash
   # Build and start all services
   docker-compose up --build -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

3. **Access the application**
   - Application: http://localhost:3000
   - MongoDB: localhost:27017

#### Docker Architecture

- **Multi-stage build**: Optimized production image
- **Frontend build**: Vite builds static assets
- **Backend runtime**: Node.js with Puppeteer support
- **MongoDB**: Dedicated database container with initialization
- **Health checks**: Automatic service monitoring
- **Security**: Non-root user execution

#### Docker Commands

```bash
# Build only the application image
docker build -t web-scraping-app .

# Run with custom environment
docker-compose -f docker-compose.yml up

# Scale services (if needed)
docker-compose up --scale web-app=2

# Remove all containers and volumes
docker-compose down -v
```

#### Production Docker Configuration

Update the environment variables in `docker-compose.yml`:

```yaml
environment:
  JWT_SECRET: your-secure-jwt-secret-here
  MONGO_URI: mongodb://username:password@mongodb:27017/web-scraping-auth
```
