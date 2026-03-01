import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/types';
import { getOrCreateUser, updateUserProfile } from '../services/StorageService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateProfile: (displayName: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getOrCreateUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const updateProfile = async (displayName: string, phone: string) => {
    const updated = await updateUserProfile({ displayName, phone });
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
