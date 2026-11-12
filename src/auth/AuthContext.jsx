import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { errorText, getPb } from '../lib/pb';

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
      pb.collection('users')
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
      async login(email, password) {
        try {
          await pb.collection('users').authWithPassword(email.trim(), password);
        } catch (err) {
          throw new Error(errorText(err));
        }
      },
      async signup({ name, email, password, passwordConfirm }) {
        try {
          await pb.collection('users').create({
            name: name.trim(),
            email: email.trim(),
            password,
            passwordConfirm,
            emailVisibility: false,
          });
          await pb.collection('users').authWithPassword(email.trim(), password);
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
