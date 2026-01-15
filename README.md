# Hoang Nguyen

# Task Management Dashboard
NX Monorepo | Angular + NestJS
This project is a full-stack task management system built using an NX monorepo.
It demonstrates authentication, role-based access control (RBAC), drag-and-drop workflows, state management, responsive UI, and automated testing.

The goal of this project is to show production-ready architecture, security practices, and clean, maintainable code across both frontend and backend.

# Key Features 
- Create, edit, delete tasks

- Categorize tasks (Work, Personal, School)

- Kanban workflow (Todo → In Progress → Review → Done)

- Drag & drop for:

    * Reordering tasks

    * Moving tasks between columns

- JWT-based authentication

- Role-based UI restrictions (Edit/Delete visibility)

- Organization-scoped data access

- Responsive design (desktop → mobile)

- Automated backend and frontend tests
# Tech Stack
Frontend:

    - Angular (Standalone Components)
    - Angular CDK (Drag & Drop)
    - Tailwind CSS
    - Jest (unit testing)

Backend

    - NestJS
    - TypeORM
    - SQLite (development)
    - JWT Authentication
    - Role-Based Access Control (RBAC)

Tooling

    - NX Monorepo
    - Jest
    - ESLint / Prettier

# Setup Instructions
- Git clone  <your-repo-url>
- cd  <repo-root>
Install Dependencies:

    -  From the repository root: npm install

Environment Configuration:
    - Create a .env file at the project root:
        # JWT
        JWT_SECRET=super_secret_key
        JWT_EXPIRES_IN=3600

        # Database
        DB_TYPE=sqlite
        DB_PATH=db.sqlite

        # Environment
        NODE_ENV=development

Note: Do not commit .env files to source control.

# Running the Applications

BackEnd(NestJS API)
    - nx serve api
API available at: http://localhost:3000

FrontEnd(Angular Dashboard)
    - nx serve dashboard

UI available at: http://localhost:4200

# Architecture Overview

    NX Monorepo Structure
    ├── api/                     # Backend (NestJS)
    │   └── src/
    │       ├── app/
    │       │   ├── audit/       # Audit logging and tracking
    │       │   ├── auth/        # Authentication & JWT logic
    │       │   ├── common/      # Shared guards, decorators, enums
    │       │   ├── organizations/ # Organization hierarchy & scope logic
    │       │   ├── seed/        # Database seed data
    │       │   ├── task/        # Task domain (CRUD, ordering, status)
    │       │   └── users/       # User management and roles
    │       │
    │       ├── app.controller.ts
    │       ├── app.module.ts
    │       ├── app.service.ts
    │       └── main.ts
    │
    ├── dashboard/               # Frontend (Angular)
    │   └── src/
    │       ├── app/
    │       │   ├── auth/        # Login UI & auth handling
    │       │   ├── guard/       # Route guards (auth / role-based)
    │       │   ├── tasks/       # Task dashboard (Kanban UI)
    │       │   └── app.routes.ts
    │       │
    │       ├── app.config.ts
    │       ├── app.component.ts
    │       ├── main.ts
    │
    ├── nx.json
    ├── package.json
    └── tsconfig.base.json


Explaination: 

Backend Architecture (NestJS):

The backend follows a domain-driven, modular NestJS architecture, where each feature is isolated in its own module.

Core Modules
    auth/

        - Handles authentication and login

        - Issues JWT tokens

        - Validates credentials

    Integrates with RBAC and organization scope

    users/

        - Manages user accounts

        - Stores user roles (OWNER, ADMIN, USER)

        - Links users to organizations

    organizations/

        - Implements organization hierarchy

        - Supports parent–child organizations

        - Determines which organization data a user can access

        - Used by other modules to enforce scoped access

    task/

        - Task CRUD operations

        - Task ordering and status transitions

        - Organization-scoped queries

        - Enforces RBAC permissions on task actions

    common/

        - Shared backend utilities used across multiple modules:

        - Role enums

        - JWT guards

        - Role guards

        - Custom decorators (e.g. @Roles)

        - Reusable helper functions

This ensures:

    Security logic is centralized

    No duplication of RBAC rules

    Consistent authorization across all endpoints

    audit/

        - Records sensitive actions (create/update/delete)

        - Designed for future compliance and tracking

        - Can be extended for logging and monitoring

    seed/

        - Development seed data

        - Used to populate users, organizations, and tasks for local testing

Frontend Architecture (Angular):

The frontend uses Angular Standalone Components and a feature-based folder structure.

    auth/

        - Login UI

        - Handles authentication flow

        - Stores JWT after login

    guard/

    Route guards for:

        - Authentication

        - Role-based access

        - Prevents unauthorized navigation

    tasks/

        - Kanban-style task dashboard

        - Drag-and-drop using Angular CDK

        - Filtering, sorting, and categorization

        - Role-aware UI (Edit/Delete hidden for unauthorized roles)

        - Fully unit-tested component logic

Core App Files

    - app.routes.ts – Defines application routes

    - app.config.ts – Global providers and configuration

    - main.ts – Application bootstrap

# Data Model Explanation

Core Entities

User (Represents an authenticated user):

- id
- email
- role (OWNER, ADMIN, USER)
- organizationId

Organization (Supports hierarchical organizations)

- id
- name
- parentOrganizationId (supports hierarchy)

Task (Represents a single item)

- id
- title
- description
- category (Work, Personal, School)
- status (Todo, InProgress, Review, Done)
- order
- organizationId
- createdById

Entity Relationships

    User ────┐
             ├── Organization ──── Task
    User ────┘


# Access Control Implementation (RBAC)

Roles
Role	Description
OWNER	Full access across organization hierarchy
ADMIN	Manage tasks within accessible organizations
USER	Limited permissions (UI-restricted actions)

- How RBAC Works

    1. User logs in → receives JWT

    2. JWT contains:

        * user ID

        * role

        * organization ID

    3. Backend:

        * Guards validate JWT

        * Role decorators enforce permissions

        * Organization scope limits data access

    4. Frontend:

        * UI hides Edit/Delete buttons for unauthorized roles

        * State logic respects backend permissions

# JWT Authentication Flow

1. User submits login form

2. Backend validates credentials

3. Backend issues JWT

4. Frontend stores JWT

5. Angular interceptor attaches JWT to all API requests

6. Backend validates JWT on every request

7. RBAC and organization scope are enforced

# API Documentation

Authentication:
    - POST /auth/login
Request:
      {
        "email": "user@example.com",
        "password": "password"
      }
Response:
    {
    "accessToken": "jwt-token"
    }

Tasks API:
GET    /tasks
POST   /tasks
PUT    /tasks/:id
DELETE /tasks/:id

All endpoints:

    * Require JWT authentication

    * Enforce RBAC permissions

    * Restrict access by organization hierarchy


# Future Considerations

- JWT refresh tokens

- CSRF protection

- Advanced role delegation

- Permission caching for performance

- Production-grade logging and monitoring

- Database scaling strategies
