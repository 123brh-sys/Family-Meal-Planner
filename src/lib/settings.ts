import { doc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Theme, UnitSystem } from '@/types/models';

export async function setUnitSystem(userId: string, unitSystem: UnitSystem): Promise<void> {
  await setDoc(doc(db, 'users', userId), { unitSystem }, { merge: true });
}

export async function setTheme(userId: string, theme: Theme): Promise<void> {
  await setDoc(doc(db, 'users', userId), { theme }, { merge: true });
}
