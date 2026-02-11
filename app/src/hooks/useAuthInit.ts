import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { signInUser } from '../firebase';

export function useAuthInit() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        const auth = getAuth();
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isMounted) return;

          if (user) {
            console.log('Auth initialized, user:', user.uid);
            setIsReady(true);
          } else {
            try {
              console.log('Signing in anonymously...');
              await signInUser();
            } catch (err) {
              const error = err instanceof Error ? err : new Error('Unknown auth error');
              console.error('Anonymous sign-in failed:', error.message);
              setError(error);
              if (isMounted) setIsReady(true);
            }
          }
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Auth initialization error');
        console.error('Auth initialization failed:', error.message);
        setError(error);
        if (isMounted) setIsReady(true);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { isReady, error };
}
