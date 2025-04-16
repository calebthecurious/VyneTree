
VyneTree
VyneTree is a modern, full-stack relationship management and portfolio web application. It features a responsive 3D portfolio front-end, robust authentication, and a secure backend API, all built with best practices for scalability and maintainability.

Features
Modern 3D Portfolio UI
Dark theme, glassmorphism, gradient text, and animations
Interactive 3D elements using Three.js and React Three Fiber
Responsive layout with Material-UI and Framer Motion
User Authentication
Secure registration and login (hashed passwords)
Session management with Passport.js and Express
Relationship & Contact Management
Manage contacts, important dates, notes, and more
Tiered relationship management
API & Data Storage
RESTful API with Express
Supabase/Postgres for persistent data storage
Drizzle ORM for type-safe database operations
Backend Services
Python FastAPI backend for additional services (optional)
CI/CD Ready
TypeScript build scripts and Python requirements included
Tech Stack
Frontend/Server: React, TypeScript, Node.js, Express, Vite, Material-UI, Three.js, React Three Fiber, Framer Motion
Database: Supabase (Postgres)
ORM: Drizzle ORM
Authentication: Passport.js, bcrypt
Backend (optional): Python 3.11+, FastAPI
Other: .env for secrets, GitHub for version control
Getting Started
1. Clone the Repository
sh
CopyInsert
git clone [https://github.com/calebthecurious/VyneTree.git](https://github.com/calebthecurious/VyneTree.git)
cd VyneTree
2. Environment Variables
Create a .env file in the root and add your secrets (see .env.example if available):

env
CopyInsert
DATABASE_URL=your_supabase_postgres_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SESSION_SECRET=your_session_secret
Do NOT commit your .env file!

3. Install Dependencies
Node/TypeScript (Frontend & Server)
sh
CopyInsert
npm install
Python Backend (optional)
sh
CopyInsert
cd backend
pip install -r requirements.txt
4. Database Setup
Ensure your Supabase database has the required tables and columns.
See /shared/schema.ts for the expected schema, or run the provided SQL migrations.
5. Build & Run
Build and Start the Server
sh
CopyInsert
npm run build
npm start
The server runs on http://localhost:5000 by default.
Python Backend (optional)
sh
CopyInsert
cd backend
uvicorn app.main:app --reload
Project Structure
CopyInsert
VyneTreeWebApp/
├── backend/         # Python FastAPI backend (optional)
├── client/          # React/Three.js client code
├── dist/            # Built production assets
├── server/          # Express server, API, authentication
├── shared/          # Shared TypeScript types and schema
├── .env             # Environment variables (not committed)
├── package.json     # Node.js project config
└── README.md        # This file
Scripts
npm run dev — Start server in development mode
npm run build — Build both server and client
npm run start — Start server in production mode
npm run build:client — Build client only
npm run build:server — Build server only
Security
Never commit your .env file or secrets.
Passwords are stored hashed using bcrypt.
Sensitive routes are protected with Passport.js sessions.
Contributing
Fork this repo
Create a feature branch (git checkout -b my-feature)
Commit your changes
Push to your fork and open a Pull Request
License
MIT License

Acknowledgements
Supabase
Drizzle ORM
React Three Fiber
Material-UI
Framer Motion
