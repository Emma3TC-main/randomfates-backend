@echo off
title RANDOMFATES BACKEND MVP SETUP

echo ==========================================
echo   RANDOMFATES BACKEND MVP SETUP
echo ==========================================
echo.

:: =====================================================
:: CLEAN PREVIOUS OVERSIZED STRUCTURE
:: =====================================================

if exist src (
    echo Removing old src structure...
    rmdir /s /q src
)

echo.
echo Old structure removed successfully.
echo.

:: =====================================================
:: ROOT
:: =====================================================

mkdir src

:: =====================================================
:: CONFIG
:: =====================================================

mkdir src\config

echo # CONFIGURATION LAYER > src\config\README.md
echo. >> src\config\README.md
echo This folder centralizes global application configuration. >> src\config\README.md
echo. >> src\config\README.md
echo Responsibilities: >> src\config\README.md
echo - Environment variables >> src\config\README.md
echo - Application constants >> src\config\README.md
echo - Server configuration >> src\config\README.md
echo - Database configuration >> src\config\README.md
echo - JWT configuration >> src\config\README.md
echo - Socket.IO configuration >> src\config\README.md
echo - Global runtime settings >> src\config\README.md

:: =====================================================
:: INFRASTRUCTURE
:: =====================================================

mkdir src\infrastructure

echo # INFRASTRUCTURE LAYER > src\infrastructure\README.md
echo. >> src\infrastructure\README.md
echo This layer contains technical implementations and external integrations. >> src\infrastructure\README.md
echo. >> src\infrastructure\README.md
echo Responsibilities: >> src\infrastructure\README.md
echo - Prisma integration >> src\infrastructure\README.md
echo - Security and authentication >> src\infrastructure\README.md
echo - WebSocket communication >> src\infrastructure\README.md
echo - Internal events >> src\infrastructure\README.md
echo - Technical infrastructure services >> src\infrastructure\README.md

mkdir src\infrastructure\prisma
echo # PRISMA INFRASTRUCTURE > src\infrastructure\prisma\README.md
echo Prisma ORM connection and database access layer. >> src\infrastructure\prisma\README.md

mkdir src\infrastructure\security
echo # SECURITY INFRASTRUCTURE > src\infrastructure\security\README.md
echo Authentication, authorization and security middlewares. >> src\infrastructure\security\README.md

mkdir src\infrastructure\websocket
echo # WEBSOCKET INFRASTRUCTURE > src\infrastructure\websocket\README.md
echo Real-time communication using Socket.IO. >> src\infrastructure\websocket\README.md

mkdir src\infrastructure\events
echo # EVENTS INFRASTRUCTURE > src\infrastructure\events\README.md
echo Internal event-driven communication system. >> src\infrastructure\events\README.md

:: =====================================================
:: SHARED
:: =====================================================

mkdir src\shared

echo # SHARED KERNEL > src\shared\README.md
echo Shared reusable components across all modules. >> src\shared\README.md

mkdir src\shared\dto
echo # DTO SHARED OBJECTS > src\shared\dto\README.md
echo Shared data transfer objects. >> src\shared\dto\README.md

mkdir src\shared\enums
echo # ENUMS > src\shared\enums\README.md
echo Global enumerations used across the application. >> src\shared\enums\README.md

mkdir src\shared\exceptions
echo # EXCEPTIONS > src\shared\exceptions\README.md
echo Centralized custom exceptions and error handling. >> src\shared\exceptions\README.md

mkdir src\shared\utils
echo # UTILITIES > src\shared\utils\README.md
echo Reusable helper and utility functions. >> src\shared\utils\README.md

mkdir src\shared\constants
echo # CONSTANTS > src\shared\constants\README.md
echo Global constants and application-wide fixed values. >> src\shared\constants\README.md

:: =====================================================
:: MODULES ROOT
:: =====================================================

mkdir src\modules

echo # BUSINESS MODULES > src\modules\README.md
echo Modular Monolith architecture modules. >> src\modules\README.md

:: =====================================================
:: AUTH MODULE
:: =====================================================

mkdir src\modules\auth
mkdir src\modules\auth\controllers
mkdir src\modules\auth\services
mkdir src\modules\auth\repositories
mkdir src\modules\auth\dto
mkdir src\modules\auth\validators
mkdir src\modules\auth\routes

echo # AUTH MODULE > src\modules\auth\README.md
echo Handles authentication and authorization. >> src\modules\auth\README.md
echo. >> src\modules\auth\README.md
echo Responsibilities: >> src\modules\auth\README.md
echo - Login >> src\modules\auth\README.md
echo - Register >> src\modules\auth\README.md
echo - JWT generation >> src\modules\auth\README.md
echo - Refresh tokens >> src\modules\auth\README.md
echo - Password hashing >> src\modules\auth\README.md
echo - Session validation >> src\modules\auth\README.md

:: =====================================================
:: USERS MODULE
:: =====================================================

mkdir src\modules\users
mkdir src\modules\users\controllers
mkdir src\modules\users\services
mkdir src\modules\users\repositories
mkdir src\modules\users\dto
mkdir src\modules\users\validators
mkdir src\modules\users\routes

echo # USERS MODULE > src\modules\users\README.md
echo User management and profile operations. >> src\modules\users\README.md

:: =====================================================
:: RAFFLES MODULE
:: =====================================================

mkdir src\modules\raffles
mkdir src\modules\raffles\controllers
mkdir src\modules\raffles\services
mkdir src\modules\raffles\repositories
mkdir src\modules\raffles\dto
mkdir src\modules\raffles\validators
mkdir src\modules\raffles\routes

echo # RAFFLES MODULE > src\modules\raffles\README.md
echo Core raffle business logic and raffle lifecycle management. >> src\modules\raffles\README.md

:: =====================================================
:: PARTICIPANTS MODULE
:: =====================================================

mkdir src\modules\participants
mkdir src\modules\participants\controllers
mkdir src\modules\participants\services
mkdir src\modules\participants\repositories
mkdir src\modules\participants\dto
mkdir src\modules\participants\validators
mkdir src\modules\participants\routes

echo # PARTICIPANTS MODULE > src\modules\participants\README.md
echo Participant registration and validation management. >> src\modules\participants\README.md

:: =====================================================
:: PRIZES MODULE
:: =====================================================

mkdir src\modules\prizes
mkdir src\modules\prizes\controllers
mkdir src\modules\prizes\services
mkdir src\modules\prizes\repositories
mkdir src\modules\prizes\dto
mkdir src\modules\prizes\validators
mkdir src\modules\prizes\routes

echo # PRIZES MODULE > src\modules\prizes\README.md
echo Prize configuration and distribution management. >> src\modules\prizes\README.md

:: =====================================================
:: EXECUTIONS MODULE
:: =====================================================

mkdir src\modules\executions
mkdir src\modules\executions\controllers
mkdir src\modules\executions\services
mkdir src\modules\executions\repositories
mkdir src\modules\executions\dto
mkdir src\modules\executions\validators
mkdir src\modules\executions\routes
mkdir src\modules\executions\engine

echo # EXECUTIONS MODULE > src\modules\executions\README.md
echo Executes secure raffle draws and random selection engine. >> src\modules\executions\README.md
echo. >> src\modules\executions\README.md
echo Important: >> src\modules\executions\README.md
echo Use crypto.randomInt instead of Math.random for integrity and auditability. >> src\modules\executions\README.md

:: =====================================================
:: RESULTS MODULE
:: =====================================================

mkdir src\modules\results
mkdir src\modules\results\controllers
mkdir src\modules\results\services
mkdir src\modules\results\repositories
mkdir src\modules\results\dto
mkdir src\modules\results\validators
mkdir src\modules\results\routes

echo # RESULTS MODULE > src\modules\results\README.md
echo Stores and exposes raffle execution results. >> src\modules\results\README.md

:: =====================================================
:: BILLING MODULE
:: =====================================================

mkdir src\modules\billing
mkdir src\modules\billing\plans
mkdir src\modules\billing\subscriptions
mkdir src\modules\billing\payments

echo # BILLING MODULE > src\modules\billing\README.md
echo SaaS billing, subscriptions and payment processing. >> src\modules\billing\README.md

:: =====================================================
:: AUDIT MODULE
:: =====================================================

mkdir src\modules\audit
mkdir src\modules\audit\services
mkdir src\modules\audit\repositories

echo # AUDIT MODULE > src\modules\audit\README.md
echo Audit logs, traceability and operational evidence. >> src\modules\audit\README.md

:: =====================================================
:: ROOT FILES
:: =====================================================

type nul > src\app.ts
type nul > src\server.ts

echo import express from 'express'; > src\app.ts
echo. >> src\app.ts
echo const app = express(); >> src\app.ts
echo. >> src\app.ts
echo export default app; >> src\app.ts

echo import app from './app'; > src\server.ts
echo. >> src\server.ts
echo const PORT = process.env.PORT ^|^| 3000; >> src\server.ts
echo. >> src\server.ts
echo app.listen(PORT, ^(\^) =^> { >> src\server.ts
echo     console.log(`Server running on port ${PORT}`); >> src\server.ts
echo }); >> src\server.ts

:: =====================================================
:: FINAL
:: =====================================================

echo.
echo ==========================================
echo   RANDOMFATES MVP STRUCTURE CREATED
echo ==========================================
echo.
echo Architecture:
echo Controller -^> Service -^> Repository -^> Prisma -^> PostgreSQL
echo.
echo Next recommended steps:
echo 1. npm init -y
echo 2. npm install express cors helmet dotenv zod bcrypt jsonwebtoken
echo 3. npm install prisma @prisma/client
echo 4. npx tsc --init
echo 5. npx prisma init
echo.

pause