# Developer Setup Guide

This document describes all tools required to work on this project, how to install them, and the daily development workflow.

---

## Current Architecture (Hybrid Local Mode)

The project runs in **hybrid mode** — only the database runs in Docker, backend and frontend run locally:

| Component | How it runs | Port |
|-----------|-------------|------|
| PostgreSQL | Docker Desktop (`postgres-db` container) | 5432 |
| Spring Boot backend | VS Code → Run & Debug (CourseCatalogApplication.java) | 8080 |
| React frontend | PowerShell → `npm start` | 3000 |

> **Alternative:** Run all three with `docker-compose up --build` from the project root. Hybrid mode is faster for active development.

---

## Required Tools

### 1. Java Development Kit (JDK 17)

The Spring Boot backend requires Java 17 to compile and run.

**Download:** https://adoptium.net/temurin/releases/?version=17
- Choose: **Windows x64 → `.msi` installer**
- Run the installer with default settings.

**Verify installation:**
```bash
java -version
# Expected output: openjdk version "17.x.x"
```

---

### 2. Apache Maven 3.9+

Maven is the build tool for the backend. It downloads dependencies, compiles code, runs tests, and packages the application.

**Download:** https://maven.apache.org/download.cgi
- Download: `apache-maven-3.9.x-bin.zip`
- Extract to `C:\Program Files\Maven\`

**Add Maven to PATH:**
1. Open Windows search → type **"Environment Variables"** → open "Edit the system environment variables"
2. Click **Environment Variables** → under *System variables*, find `Path` → click **Edit**
3. Click **New** → enter: `C:\Program Files\Maven\apache-maven-3.9.x\bin`
4. Click OK on all dialogs

**Verify installation:**
```bash
mvn -version
# Expected output: Apache Maven 3.9.x
```

> **Note:** If you install the "Extension Pack for Java" VS Code extension (see below), Maven integration is included and the PATH step may be skipped for VS Code usage.

---

### 3. Node.js 20 LTS + npm

Node.js is the runtime for the React frontend build toolchain. npm manages JavaScript packages and is bundled with Node.js.

**Download:** https://nodejs.org/en → choose **20.x.x LTS → Windows Installer (.msi)**
- Run the installer with default settings.

**Verify installation:**
```bash
node -version
# Expected: v20.x.x

npm -version
# Expected: 10.x.x
```

---

### 4. Docker Desktop

Docker Desktop runs the PostgreSQL database in an isolated container, so no local PostgreSQL installation is needed.

**Download:** https://www.docker.com/products/docker-desktop/
- Run the installer and restart the computer when prompted.
- Open Docker Desktop after restart and complete the setup wizard.
- Sign in or skip — a Docker account is not required for local use.

**Verify installation:**
```bash
docker -version
# Expected: Docker version 26.x.x or higher
```

**Starting the database:**
```bash
# From the project root directory:
docker-compose up postgres-db -d

# The -d flag runs it in the background (detached).
# To stop the database:
docker-compose down
```

---

### 5. Git

Git is used for version control — committing changes, creating branches, and pushing to GitHub.

**Download:** https://git-scm.com/download/win
- During setup, choose: **"Use Visual Studio Code as Git's default editor"**
- All other settings can remain at their defaults.

**Verify installation:**
```bash
git -version
# Expected: git version 2.x.x
```

**One-time configuration (run once after installation):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your@student.email.lv"
```

---

## VS Code Extensions

Open VS Code → press **Ctrl+Shift+X** to open the Extensions panel → search by name and install:

### Mandatory Extensions

| Extension Name | Publisher | Purpose |
|----------------|-----------|---------|
| **Extension Pack for Java** | Microsoft | Java language support, code completion, debugger, Maven integration |
| **Spring Boot Extension Pack** | VMware (Broadcom) | Spring Boot run/debug, live beans view, `application.properties` autocompletion |
| **ESLint** | Microsoft | Highlights JavaScript/React errors and code issues as you type |
| **Prettier - Code formatter** | Prettier | Automatically formats JS, JSX, JSON, and CSS files |

**Configure Prettier as default formatter:**
1. Open Settings: **Ctrl+,**
2. Search for: `default formatter`
3. Set **Editor: Default Formatter** to `Prettier - Code formatter`
4. Search for: `format on save`
5. Enable **Editor: Format On Save**

### Recommended Extensions

| Extension Name | Publisher | Purpose |
|----------------|-----------|---------|
| **GitLens** | GitKraken | Shows git blame, commit history, and branch info inline in the editor |
| **REST Client** | Huachao Mao | Test API endpoints directly from `.http` files — a lightweight alternative to Postman |
| **Docker** | Microsoft | View and manage Docker containers directly from the VS Code sidebar |
| **Tailwind CSS IntelliSense** | Tailwind Labs | Autocomplete and preview for Tailwind CSS class names in JSX files |

---

## Environment Variables Setup

The project uses environment variables to store database credentials and configuration. These are kept out of version control.

**Create file:** `projekts/.env` (in the root of the project, next to `docker-compose.yml`)

```
DB_URL=jdbc:postgresql://localhost:5432/course_catalog
DB_USERNAME=user
DB_PASSWORD=password
SPRING_PROFILES_ACTIVE=dev
```

> This file is listed in `.gitignore` and will not be committed to the repository.

The VS Code launch configuration (`launch.json`) already references this file, so the backend will automatically load these variables when started from VS Code.

---

## Daily Development Workflow

### Step 1 — Start the database

Open a terminal (PowerShell or VS Code terminal) and run from the project root:

```bash
docker-compose up postgres-db -d
```

Check Docker Desktop → the `postgres-db` container should show status **Running**.

### Step 2 — Start the backend

1. Open VS Code with the project folder
2. Open the **Run & Debug** panel: **Ctrl+Shift+D**
3. Select **"Spring Boot-CourseCatalogApplication"** from the dropdown at the top
4. Press ▶ **Run** (or **F5**)
5. Wait until the VS Code terminal shows:
   ```
   Started CourseCatalogApplication in X.XXX seconds
   ```

### Step 3 — Start the frontend

Open a new PowerShell window and run:

```bash
cd C:\Users\justi\Documents\BakalauraDarbs\projekts\frontend\reactapp
npm start
```

The browser will open automatically at `http://localhost:3000`.

### Step 4 — Verify everything is working

| URL | Expected result |
|-----|----------------|
| `http://localhost:3000` | Course list loads from the database |
| `http://localhost:8080/api/courses` | Returns a JSON array of courses |
| `http://localhost:8080/swagger-ui.html` | Interactive API documentation *(available after Swagger is added)* |

---

## Branch Workflow for New Features

```bash
# Before starting any new work, sync with main:
git checkout main
git pull origin main

# Create a feature branch:
git checkout -b feature/short-description

# After finishing work on the feature:
git add path/to/changed/file.java
git commit -m "Short description of what was done"
git push origin feature/short-description

# Then open GitHub and create a Pull Request: feature/short-description → main
```

---

## Running Full Stack with Docker (Alternative)

If you want to run everything in Docker instead of the hybrid local setup:

```bash
# Build and start all services:
docker-compose up --build

# Stop all services:
docker-compose down
```

> Note: When using Docker, the backend connects to `postgres-db` (the Docker hostname), not `localhost`. The `application.properties` datasource URL must be switched accordingly, or the `DB_URL` environment variable set in `docker-compose.yml`.

---

## Useful Commands Reference

```bash
# Backend
mvn clean install          # Build the project (downloads dependencies)
mvn spring-boot:run        # Run backend locally (requires local Java + Maven)
mvn test                   # Run all backend tests
mvn test -Dtest=ClassName  # Run a single test class

# Frontend
npm install                # Install dependencies (run once after cloning)
npm start                  # Start dev server on port 3000
npm run build              # Create production build
npm test                   # Run frontend tests

# Docker
docker-compose up postgres-db -d     # Start only the database (background)
docker-compose up --build            # Start all services
docker-compose down                  # Stop all services
docker ps                            # List running containers
docker logs postgres-db              # View database logs
```
