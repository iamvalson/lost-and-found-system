# 🏷️ Campus Lost & Found Management System

A full-stack, enterprise-ready Web Application designed to streamline the reporting, tracking, matching, and claiming of lost and found items across university campuses.

Built with **Spring Boot 3 (Java 17)** backend, **Next.js 16 & React 19** frontend, **JWT Authentication**, and automated matching algorithms.

---

## 🌟 Key Features

- **🔍 Browse & Search Directory**: Search lost and found records by keywords, category filters, location, and date.
- **📝 Report Lost & Found Items**: Submit reports with detailed descriptions, location lost/found, date, category, and holding locations.
- **🤖 Smart Automated Matching**: Intelligent matching engine that automatically detects potential matches between lost items and reported found items based on category, location, and descriptions.
- **🙋 Claim Management System**: Students can submit claims for found items; campus administrators can review, confirm, or reject claims.
- **📊 Admin Dashboard**: Statistics and metrics overview for campus safety and lost-and-found administrators.
- **🛡️ Role-Based Security**: Secured with JWT stateless authentication for Students and Campus Admins.

---

## 🛠️ Technology Stack

### **Backend**
- **Framework**: Spring Boot `3.2.5`
- **Language**: Java `17`
- **Security**: Spring Security `6` with JWT (`io.jsonwebtoken 0.11.5`)
- **Database**: H2 Database (In-Memory for Dev/Testing), MySQL compatible for Production
- **ORM / Persistence**: Spring Data JPA / Hibernate
- **Testing**: JUnit 5, Spring Security Test

### **Frontend**
- **Framework**: Next.js `16.3.3` (App Router, Turbopack)
- **Library**: React `19.2.8`
- **Styling**: Vanilla CSS Modules (Glassmorphism, CSS Custom Properties Design Tokens, Micro-animations)
- **HTTP Client**: Native Fetch API with custom API client wrapper (`lib/api.js`)

---

## 📁 Repository Structure

```text
campus-lost-and-found/
├── src/                          # Spring Boot Backend Source Code
│   ├── main/
│   │   ├── java/com/lostandfound/
│   │   │   ├── config/           # Security, CORS & Data Seeder Configuration
│   │   │   ├── controller/       # REST API Controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── exception/        # Global Exception Handler
│   │   │   ├── model/            # JPA Entities & Enums
│   │   │   ├── repository/       # Spring Data JPA Repositories
│   │   │   ├── security/         # JWT Filters & UserDetails Service
│   │   │   └── service/          # Business Logic & Matching Engine
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-prod.properties
│   └── test/                     # Integration & Scenario Tests
├── frontend/                     # Next.js Frontend Application
│   ├── app/                      # Next.js App Router Pages (Browse, Report, Dashboard, Admin)
│   ├── components/               # Reusable UI Components (NavBar, ReportCard, MobileNav)
│   ├── lib/                      # API Client, Auth Context, Toast Context
│   └── public/                   # Static Assets & Screenshots
├── pom.xml                       # Maven Build Configuration
└── README.md                     # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Java 17 JDK** or higher
- **Maven 3.8+**
- **Node.js 18+** & **npm**

---

### 1. Running the Backend Server

1. Open your terminal in the project root folder:
   ```bash
   cd csc202-project/lost-and-found-system
   ```

2. Start the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```

3. The backend server will start at **`http://localhost:8085`**.

> **Note**: Default data (categories and admin account) will be seeded automatically on startup.

---

### 2. Running the Frontend Application

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies (if running for the first time):
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to **`http://localhost:3000`**.

---

## 🔐 Default Credentials & H2 Console

### Default Admin Account
- **Email**: `admin@campus.edu`
- **Password**: `admin123`

### H2 Database Console
- **URL**: `http://localhost:8085/h2-console`
- **JDBC URL**: `jdbc:h2:mem:lostandfounddb`
- **Username**: `sa`
- **Password**: *(leave empty)*

---

## 📡 API Reference Endpoint Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/categories` | List all item categories | Public |
| `GET` | `/api/reports/search` | Search lost and found reports | Public |
| `GET` | `/api/reports/{id}` | Get detailed report by ID | Public |
| `POST` | `/api/reports` | Create a new lost or found report | Authenticated |
| `GET` | `/api/reports/my` | Get reports created by logged-in user | Authenticated |
| `GET` | `/api/reports/{id}/matches` | Get matching reports for an item | Authenticated |
| `POST` | `/api/claims` | Submit a claim for a found item | Authenticated |
| `GET` | `/api/claims/my` | Get claims submitted by logged-in user | Authenticated |
| `GET` | `/api/admin/claims` | List all pending claims | Admin |
| `PUT` | `/api/admin/claims/{id}/confirm` | Approve & confirm item claim | Admin |
| `PUT` | `/api/admin/claims/{id}/reject` | Reject item claim | Admin |
| `GET` | `/api/admin/dashboard` | Get dashboard overview statistics | Admin |

---

## 🧪 Testing

Run automated integration tests for backend APIs and matching logic:

```bash
mvn test
```

---

## 📄 License

This project is developed for educational and campus administration purposes under the MIT License.
