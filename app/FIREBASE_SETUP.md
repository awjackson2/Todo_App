# Firebase Setup Guide for Todo App

## 🚀 Quick Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `todo-app` (or your preferred name)
4. Disable Google Analytics (optional for personal use)
5. Click "Create project"

### 2. Enable Firestore Database
1. In your Firebase project dashboard, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location closest to you
5. Click "Done"

### 3. Enable Authentication
1. Click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication
5. Optionally enable "Google" for better user experience

### 4. Get Firebase Configuration
1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Enter app nickname: `todo-app-web`
6. Click "Register app"
7. **Copy the configuration object** - you'll need this!

### 5. Configure Your App

#### Option A: Environment Variables (Recommended)
Create a file called `.env.local` in your `app` folder with:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase config.

#### Option B: Direct Configuration
Edit `app/src/firebase.ts` and replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 6. Secure Firestore Rules
1. Go to Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 7. Test Your Setup
1. Run your app: `npm run dev`
2. Open the app in your browser
3. You should see "Connecting to database..." briefly
4. Then you should see "• Synced" next to the title
5. Try adding a task - it should save to Firebase!

## 🔧 Troubleshooting

### "Failed to connect to database" Error
- Check your internet connection
- Verify your Firebase config is correct
- Make sure Firestore is enabled in Firebase Console
- Check browser console for detailed error messages

### Data Not Syncing
- Ensure you're signed in (check browser console for auth status)
- Verify Firestore rules allow authenticated users
- Check if you have multiple Firebase projects and are using the right one

### Migration from Local Storage
- Your existing IndexedDB data will automatically migrate to Firebase
- The migration happens on first load after Firebase setup
- Original local data remains as backup

## 🌟 Features You Get

✅ **Real-time sync** - Changes appear instantly across all devices
✅ **Offline support** - Works even without internet (syncs when reconnected)
✅ **Automatic backup** - Your data is safely stored in the cloud
✅ **Cross-device access** - Access your todos from any device
✅ **Anonymous authentication** - No sign-up required
✅ **Data migration** - Existing todos are automatically imported

## 🔒 Security Notes

- Your data is private to your anonymous user ID
- Each browser/device gets a unique anonymous user
- To share data across devices, consider enabling Google sign-in
- Firestore rules ensure only authenticated users can access data

## 📱 Using on Multiple Devices

1. **Same browser on different computers**: Data will sync automatically
2. **Different browsers**: Each gets a separate anonymous user (separate data)
3. **Mobile devices**: Works the same way as desktop
4. **To share data across devices**: Enable Google sign-in in Firebase Console

## 🆓 Free Tier Limits

Firebase free tier includes:
- 1GB Firestore storage
- 20,000 reads per day
- 20,000 writes per day
- 20,000 deletes per day

This is more than enough for personal todo usage!

## 🚀 Next Steps

Once everything is working:
1. Consider enabling Google sign-in for better cross-device sync
2. Set up Firebase Hosting to deploy your app
3. Add more features like task sharing or categories
4. Set up monitoring and analytics

## 📞 Need Help?

- Check the browser console for error messages
- Verify your Firebase project settings
- Make sure all steps were completed correctly
- Firebase documentation: https://firebase.google.com/docs
