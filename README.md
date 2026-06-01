# Smart Task Manager

A MERN stack web application for student task management, class scheduling, and academic profile tracking. Features dual portals for students and faculty/admins, giving different permissions to each.

## Features
- **Student Portal**: View and complete assignments and tasks. Keep track of academic details.
- **Admin/Faculty Portal**: Manage student records, publish attendance updates, add teachers to the directory, and configure weekly class schedules.
- **Offline Fallback**: Uses local storage to save tasks, schedules, and profiles locally if the backend server is offline.
- **Custom Portals**: Sleek and fast light-themed interface.

## Tech Stack
- **Frontend**: React (JS, CSS, Tailwind)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Directory Structure
- `/backend`: Node/Express server and MongoDB models/routes
- `/frontend`: React application client

## Setup and Running

### 1. Backend Server
Go to the backend directory, install dependencies, and start the server:
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:5002`

### 2. Frontend Client
Go to the frontend directory, install dependencies, and start the React app:
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`