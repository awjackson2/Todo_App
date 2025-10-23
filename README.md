# Todo App

A modern, responsive todo list application built with React, TypeScript, and Firebase.

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
