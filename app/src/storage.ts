import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, Quote } from './types';

// Helper to get user document reference
function getUserDoc() {
  // Use a shared user ID for all devices - simple sync solution
  const sharedUserId = 'shared-user';
  return doc(db, 'users', sharedUserId);
}

// Legacy migration from IndexedDB
async function migrateFromIndexedDB(): Promise<void> {
  try {
    const { get } = await import('idb-keyval');
    const [legacyTasks, legacyCompleted] = await Promise.all([
      get<Task[] | undefined>('tasks'),
      get<Task[] | undefined>('completedTasks'),
    ]);

    if (legacyTasks && legacyTasks.length > 0) {
      const userDoc = getUserDoc();
      
      // Save both tasks and completed in the same user document
      await setDoc(userDoc, {
        tasks: legacyTasks.map(task => cleanTaskForFirebase(task)),
        completed: (legacyCompleted || []).map(task => cleanTaskForFirebase(task)),
        lastUpdated: serverTimestamp()
      });

      console.log('Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}


// Get all tasks
export async function getTasks(): Promise<Task[]> {
  try {
    console.log('Getting tasks from Firebase...');
    const userDoc = getUserDoc();
    console.log('User document path:', userDoc.path);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('Found tasks in Firebase:', data.tasks?.length || 0, 'tasks');
      return data.tasks || [];
    }
    
    console.log('No tasks found in Firebase, trying migration...');
    // Try migration if no data found
    await migrateFromIndexedDB();
    return [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Helper function to clean task data for Firebase
function cleanTaskForFirebase(task: Task) {
  const cleaned = { ...task };
  // Remove undefined values
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key as keyof Task] === undefined) {
      delete cleaned[key as keyof Task];
    }
  });
  return cleaned;
}

// Save tasks
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    console.log('Saving tasks to Firebase:', tasks.length, 'tasks');
    const userDoc = getUserDoc();
    console.log('User document path:', userDoc.path);
    await setDoc(userDoc, {
      tasks: tasks.map(task => cleanTaskForFirebase(task)),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log('Tasks saved successfully to Firebase');
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

// Get completed tasks
export async function getCompletedTasks(): Promise<Task[]> {
  try {
    const userDoc = getUserDoc();
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      return snapshot.data().completed || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting completed tasks:', error);
    return [];
  }
}

// Save completed tasks
export async function saveCompletedTasks(completed: Task[]): Promise<void> {
  try {
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      completed: completed.map(task => cleanTaskForFirebase(task)),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving completed tasks:', error);
  }
}

// Save all data at once
export async function saveAll(tasks: Task[], completed: Task[]): Promise<void> {
  try {
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      tasks: tasks.map(task => cleanTaskForFirebase(task)),
      completed: completed.map(task => cleanTaskForFirebase(task)),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving all data:', error);
  }
}

// Real-time listener for live updates (single subscription for both tasks and completed)
export function subscribeToUserData(callback: (tasks: Task[], completed: Task[]) => void): () => void {
  const userDoc = getUserDoc();
  console.log('Setting up real-time subscription for:', userDoc.path);
  
  return onSnapshot(userDoc, (snapshot) => {
    console.log('Real-time update received:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('Data from Firebase:', { tasks: data.tasks?.length || 0, completed: data.completed?.length || 0 });
      callback(data.tasks || [], data.completed || []);
    } else {
      console.log('No data in Firebase document');
      callback([], []);
    }
  }, (error) => {
    console.error('Error listening to user data:', error);
    callback([], []);
  });
}

// XP System Functions
export async function saveXPData(xp: number, level: number): Promise<void> {
  try {
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      xp: xp,
      level: level,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log('XP data saved successfully to Firebase');
  } catch (error) {
    console.error('Error saving XP data:', error);
  }
}

export async function getXPData(): Promise<{ xp: number; level: number }> {
  try {
    const userDoc = getUserDoc();
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        xp: data.xp || 0,
        level: data.level || 1
      };
    }
    return { xp: 0, level: 1 };
  } catch (error) {
    console.error('Error getting XP data:', error);
    return { xp: 0, level: 1 };
  }
}

// Pinned Quotes Functions
export async function getPinnedQuotes(): Promise<Quote[]> {
  try {
    const userDoc = getUserDoc();
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      return snapshot.data().pinnedQuotes || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting pinned quotes:', error);
    return [];
  }
}

export async function savePinnedQuotes(quotes: Quote[]): Promise<void> {
  try {
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      pinnedQuotes: quotes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log('Pinned quotes saved successfully to Firebase');
  } catch (error) {
    console.error('Error saving pinned quotes:', error);
  }
}

export async function addPinnedQuote(quote: Omit<Quote, 'id' | 'pinnedAt'>): Promise<void> {
  try {
    const existingQuotes = await getPinnedQuotes();
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      pinnedAt: Date.now()
    };
    
    // Check if quote already exists (by text and author)
    const exists = existingQuotes.some(q => 
      q.text === newQuote.text && q.author === newQuote.author
    );
    
    if (!exists) {
      await savePinnedQuotes([...existingQuotes, newQuote]);
    }
  } catch (error) {
    console.error('Error adding pinned quote:', error);
  }
}

export async function removePinnedQuote(quoteId: string): Promise<void> {
  try {
    const existingQuotes = await getPinnedQuotes();
    const filteredQuotes = existingQuotes.filter(q => q.id !== quoteId);
    await savePinnedQuotes(filteredQuotes);
  } catch (error) {
    console.error('Error removing pinned quote:', error);
  }
}

// Theme Settings Functions
export async function getThemeSettings(): Promise<{ themeId: string; isDarkMode: boolean }> {
  try {
    const userDoc = getUserDoc();
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        themeId: data.themeId || 'default',
        isDarkMode: data.isDarkMode || false
      };
    }
    return { themeId: 'default', isDarkMode: false };
  } catch (error) {
    console.error('Error getting theme settings:', error);
    return { themeId: 'default', isDarkMode: false };
  }
}

export async function saveThemeSettings(themeId: string, isDarkMode: boolean): Promise<void> {
  try {
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      themeId: themeId,
      isDarkMode: isDarkMode,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log('Theme settings saved successfully to Firebase');
  } catch (error) {
    console.error('Error saving theme settings:', error);
  }
}

// Real-time listener for theme settings
export function subscribeToThemeSettings(callback: (themeId: string, isDarkMode: boolean) => void): () => void {
  const userDoc = getUserDoc();
  console.log('Setting up real-time subscription for theme settings:', userDoc.path);
  
  return onSnapshot(userDoc, (snapshot) => {
    console.log('Theme settings update received:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.data();
      const themeId = data.themeId || 'default';
      const isDarkMode = data.isDarkMode || false;
      console.log('Theme settings:', { themeId, isDarkMode });
      callback(themeId, isDarkMode);
    } else {
      console.log('No theme settings in Firebase document');
      callback('default', false);
    }
  }, (error) => {
    console.error('Error listening to theme settings:', error);
    callback('default', false);
  });
}


