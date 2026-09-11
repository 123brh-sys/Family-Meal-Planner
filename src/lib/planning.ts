import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export interface Planning {
  selectedMealIds: string[];
}

const planningRef = (familyId: string) => doc(db, 'families', familyId, 'meta', 'planning');

export function subscribePlanning(
  familyId: string,
  onChange: (planning: Planning) => void
): Unsubscribe {
  return onSnapshot(planningRef(familyId), (snap) => {
    onChange(snap.exists() ? (snap.data() as Planning) : { selectedMealIds: [] });
  });
}

export async function setMealSelected(
  familyId: string,
  mealId: string,
  selected: boolean
): Promise<void> {
  await setDoc(
    planningRef(familyId),
    { selectedMealIds: selected ? arrayUnion(mealId) : arrayRemove(mealId) },
    { merge: true }
  );
}
