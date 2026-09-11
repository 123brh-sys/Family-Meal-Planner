import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import type { Family, UserSettings } from '@/types/models';

interface FamilyContextValue {
  settings: UserSettings | null;
  family: Family | null;
  loading: boolean;
}

const FamilyContext = createContext<FamilyContextValue>({
  settings: null,
  family: null,
  loading: true,
});

const defaultSettings = (userId: string): UserSettings => ({
  userId,
  familyId: null,
  unitSystem: 'metric',
  theme: 'system',
});

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [familyLoaded, setFamilyLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setSettingsLoaded(true);
      return;
    }
    setSettingsLoaded(false);
    const ref = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        const fresh = defaultSettings(user.uid);
        await setDoc(ref, fresh);
        setSettings(fresh);
      } else {
        setSettings(snap.data() as UserSettings);
      }
      setSettingsLoaded(true);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!settings?.familyId) {
      setFamily(null);
      setFamilyLoaded(true);
      return;
    }
    setFamilyLoaded(false);
    const ref = doc(db, 'families', settings.familyId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setFamily(snap.exists() ? (snap.data() as Family) : null);
      setFamilyLoaded(true);
    });
    return unsubscribe;
  }, [settings?.familyId]);

  return (
    <FamilyContext.Provider
      value={{ settings, family, loading: !settingsLoaded || !familyLoaded }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  return useContext(FamilyContext);
}
