# Todo App

A modern, responsive todo list application built with React, TypeScript, and Firebase.
<img width="1280" height="617" alt="light-main-ui" src="https://github.com/user-attachments/assets/3f9df3e5-6c73-49c6-956d-fc9d5afab6e0" />
<img width="1262" height="611" alt="dark-theme-selector" src="https://github.com/user-attachments/assets/59c03113-2099-4d3e-a3db-5a8324efd906" />
<img width="510" height="107" alt="dark-xp-bar" src="https://github.com/user-attachments/assets/31019600-b90e-4047-99f5-bab5d9ff3484" />
<img width="1265" height="585" alt="dark-task-timeline" src="https://github.com/user-attachments/assets/72cec823-4a09-4a64-a221-359fcb54154b" />
<img width="224" height="131" alt="dark-quote" src="https://github.com/user-attachments/assets/aa3fc60f-486e-4b40-b168-1998a23eef73" />
<img width="1275" height="583" alt="dark-hall-of-quotes" src="https://github.com/user-attachments/assets/afb87939-99ae-44fd-9388-5df31d8874ff" />

## Features

- ✅ Add, edit, and delete tasks
- 🔄 Real-time sync across devices
- 📱 Responsive design
- 🎨 Dark/light theme support
- 💾 Offline support with IndexedDB
- 🔐 Anonymous authentication
- 📊 XP system for task completion

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Todo_App
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the environment template
   cp env.template .env
   
   # Edit .env with your Firebase configuration
   # Get these values from Firebase Console > Project Settings > General > Your apps
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication (Anonymous)
3. Get your Firebase configuration from Project Settings
4. Copy `env.template` to `.env` and fill in your Firebase config values

See `app/FIREBASE_SETUP.md` for detailed setup instructions.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Bootstrap 5, React Bootstrap
- **Backend**: Firebase Firestore, Firebase Auth
- **Storage**: IndexedDB (local), Firestore (cloud)
- **Build Tool**: Vite

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security

- Firebase configuration is stored in environment variables
- Anonymous authentication for privacy
- Firestore security rules protect user data
