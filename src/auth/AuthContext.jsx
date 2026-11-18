import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { errorText, getPb, isSuperuser } from '../lib/pb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const pb = getPb();
  const [user, setUser] = useState(pb.authStore.record);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });
    if (pb.authStore.isValid) {
      const collection = isSuperuser(pb.authStore.record) ? '_superusers' : 'users';
      pb.collection(collection)
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
    return () => unsubscribe();
  }, [pb]);

  const api = useMemo(() => {
    return {
      user,
      ready,
      superuser: isSuperuser(user),
      async login(email, password) {
        const identity = email.trim();
        try {
          await pb.collection('users').authWithPassword(identity, password);
        } catch (userErr) {
          if (!userErr?.status || userErr.status >= 500) throw new Error(errorText(userErr));
          try {
            await pb.collection('_superusers').authWithPassword(identity, password);
          } catch {
            throw new Error(errorText(userErr));
          }
        }
      },
      async requestVerification(email) {
        try {
          await pb.collection('users').requestVerification(email.trim());
        } catch (err) {
          throw new Error(errorText(err));
        }
      },
      async confirmVerification(token) {
        try {
          await pb.collection('users').confirmVerification(token);
        } catch (err) {
          throw new Error(errorText(err));
        }
        if (pb.authStore.isValid && !isSuperuser(pb.authStore.record)) {
          try {
            await pb.collection('users').authRefresh();
          } catch {
            pb.authStore.clear();
          }
        }
      },
      async requestPasswordReset(email) {
        try {
          await pb.collection('users').requestPasswordReset(email.trim());
        } catch (err) {
          throw new Error(errorText(err));
        }
      },
      async confirmPasswordReset(token, password, passwordConfirm) {
        try {
          await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
          pb.authStore.clear();
        } catch (err) {
          throw new Error(errorText(err));
        }
      },
      async refresh() {
        const collection = isSuperuser(pb.authStore.record) ? '_superusers' : 'users';
        try {
          await pb.collection(collection).authRefresh();
        } catch (err) {
          throw new Error(errorText(err));
        }
      },
      logout() {
        window.location.hash = '#top';
        pb.authStore.clear();
      },
    };
  }, [pb, user, ready]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
