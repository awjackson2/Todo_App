import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebase';
import type { Task, Quote } from './types';

// Auth initialization promise
let authReady = false;
const authReadyPromise = new Promise<void>((resolve) => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      authReady = true;
      resolve();
      unsubscribe();
    }
  });

  setTimeout(() => {
    if (!authReady) {
      authReady = true;
      resolve();
    }
  }, 5000);
});

export async function ensureAuthReady(): Promise<void> {
  if (authReady) return;
  return authReadyPromise;
}

// Helper to check authentication state
function isUserAuthenticated(): boolean {
  const auth = getAuth();
  return auth.currentUser !== null;
}

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
async function getTasks_internal(): Promise<Task[]> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, returning empty tasks');
      return [];
    }
    const userDoc = getUserDoc();
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.tasks || [];
    }
    
    await migrateFromIndexedDB();
    return [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureAuthReady();
  return getTasks_internal();
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
async function saveTasks_internal(tasks: Task[]): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save tasks');
      return;
    }
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      tasks: tasks.map(task => cleanTaskForFirebase(task)),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await ensureAuthReady();
  return saveTasks_internal(tasks);
}

// Get completed tasks
async function getCompletedTasks_internal(): Promise<Task[]> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, returning empty completed tasks');
      return [];
    }
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

export async function getCompletedTasks(): Promise<Task[]> {
  await ensureAuthReady();
  return getCompletedTasks_internal();
}

// Save completed tasks
async function saveCompletedTasks_internal(completed: Task[]): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save completed tasks');
      return;
    }
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      completed: completed.map(task => cleanTaskForFirebase(task)),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving completed tasks:', error);
  }
}

export async function saveCompletedTasks(completed: Task[]): Promise<void> {
  await ensureAuthReady();
  return saveCompletedTasks_internal(completed);
}

// Save all data at once
async function saveAll_internal(tasks: Task[], completed: Task[]): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save data');
      return;
    }
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

export async function saveAll(tasks: Task[], completed: Task[]): Promise<void> {
  await ensureAuthReady();
  return saveAll_internal(tasks, completed);
}

// Real-time listener for live updates
function subscribeToUserData_internal(callback: (tasks: Task[], completed: Task[]) => void): () => void {
  if (!isUserAuthenticated()) {
    console.warn('User not authenticated, cannot subscribe to user data');
    return () => {};
  }
  const userDoc = getUserDoc();
  
  return onSnapshot(userDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.tasks || [], data.completed || []);
    } else {
      callback([], []);
    }
  }, (error) => {
    console.error('Error listening to user data:', error);
    callback([], []);
  });
}

export async function subscribeToUserData(callback: (tasks: Task[], completed: Task[]) => void): Promise<() => void> {
  await ensureAuthReady();
  return subscribeToUserData_internal(callback);
}

// XP System Functions
async function saveXPData_internal(xp: number, level: number): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save XP data');
      return;
    }
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      xp: xp,
      level: level,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving XP data:', error);
  }
}

export async function saveXPData(xp: number, level: number): Promise<void> {
  await ensureAuthReady();
  return saveXPData_internal(xp, level);
}

async function getXPData_internal(): Promise<{ xp: number; level: number }> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, returning default XP data');
      return { xp: 0, level: 1 };
    }
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

export async function getXPData(): Promise<{ xp: number; level: number }> {
  await ensureAuthReady();
  return getXPData_internal();
}

// Pinned Quotes Functions
async function getPinnedQuotes_internal(): Promise<Quote[]> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, returning empty quotes');
      return [];
    }
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

export async function getPinnedQuotes(): Promise<Quote[]> {
  await ensureAuthReady();
  return getPinnedQuotes_internal();
}

async function savePinnedQuotes_internal(quotes: Quote[]): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save pinned quotes');
      return;
    }
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      pinnedQuotes: quotes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving pinned quotes:', error);
  }
}

export async function savePinnedQuotes(quotes: Quote[]): Promise<void> {
  await ensureAuthReady();
  return savePinnedQuotes_internal(quotes);
}

export async function addPinnedQuote(quote: Omit<Quote, 'id' | 'pinnedAt'>): Promise<void> {
  await ensureAuthReady();
  try {
    const existingQuotes = await getPinnedQuotes_internal();
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      pinnedAt: Date.now()
    };
    
    const exists = existingQuotes.some(q => 
      q.text === newQuote.text && q.author === newQuote.author
    );
    
    if (!exists) {
      await savePinnedQuotes_internal([...existingQuotes, newQuote]);
    }
  } catch (error) {
    console.error('Error adding pinned quote:', error);
  }
}

export async function removePinnedQuote(quoteId: string): Promise<void> {
  await ensureAuthReady();
  try {
    const existingQuotes = await getPinnedQuotes_internal();
    const filteredQuotes = existingQuotes.filter(q => q.id !== quoteId);
    await savePinnedQuotes_internal(filteredQuotes);
  } catch (error) {
    console.error('Error removing pinned quote:', error);
  }
}

// Theme Settings Functions
async function getThemeSettings_internal(): Promise<{ themeId: string; isDarkMode: boolean }> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, returning default theme settings');
      return { themeId: 'default', isDarkMode: false };
    }
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

export async function getThemeSettings(): Promise<{ themeId: string; isDarkMode: boolean }> {
  await ensureAuthReady();
  return getThemeSettings_internal();
}

async function saveThemeSettings_internal(themeId: string, isDarkMode: boolean): Promise<void> {
  try {
    if (!isUserAuthenticated()) {
      console.warn('User not authenticated, cannot save theme settings');
      return;
    }
    const userDoc = getUserDoc();
    await setDoc(userDoc, {
      themeId: themeId,
      isDarkMode: isDarkMode,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving theme settings:', error);
  }
}

export async function saveThemeSettings(themeId: string, isDarkMode: boolean): Promise<void> {
  await ensureAuthReady();
  return saveThemeSettings_internal(themeId, isDarkMode);
}

function subscribeToThemeSettings_internal(callback: (themeId: string, isDarkMode: boolean) => void): () => void {
  if (!isUserAuthenticated()) {
    console.warn('User not authenticated, cannot subscribe to theme settings');
    return () => {};
  }
  const userDoc = getUserDoc();
  
  return onSnapshot(userDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const themeId = data.themeId || 'default';
      const isDarkMode = data.isDarkMode || false;
      callback(themeId, isDarkMode);
    } else {
      callback('default', false);
    }
  }, (error) => {
    console.error('Error listening to theme settings:', error);
    callback('default', false);
  });
}

export async function subscribeToThemeSettings(callback: (themeId: string, isDarkMode: boolean) => void): Promise<() => void> {
  await ensureAuthReady();
  return subscribeToThemeSettings_internal(callback);
}


