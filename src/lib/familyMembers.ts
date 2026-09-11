import {
  arrayRemove,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { FamilyMember } from '@/types/models';

function membersCollection(familyId: string) {
  return collection(db, 'families', familyId, 'members');
}

export function subscribeFamilyMembers(
  familyId: string,
  onChange: (members: FamilyMember[]) => void
): Unsubscribe {
  return onSnapshot(membersCollection(familyId), (snap) => {
    const members = snap.docs.map((d) => d.data() as FamilyMember);
    members.sort((a, b) => a.createdAt - b.createdAt);
    onChange(members);
  });
}

export async function addFamilyMember(familyId: string, name: string): Promise<void> {
  const ref = doc(membersCollection(familyId));
  const member: FamilyMember = {
    id: ref.id,
    familyId,
    name: name.trim(),
    isPantryManager: false,
    isArchived: false,
    allergies: [],
    createdAt: Date.now(),
  };
  await setDoc(ref, member);
}

export async function renameFamilyMember(
  familyId: string,
  memberId: string,
  name: string
): Promise<void> {
  await updateDoc(doc(membersCollection(familyId), memberId), { name: name.trim() });
}

/** Allergies are a hard "can't eat" constraint — distinct from likedBy's "doesn't like". */
export async function setAllergies(
  familyId: string,
  memberId: string,
  allergiesText: string
): Promise<void> {
  const allergies = allergiesText
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);
  await updateDoc(doc(membersCollection(familyId), memberId), { allergies });
}

/** Hides the member from active use without touching any meal's likedBy list. */
export async function archiveFamilyMember(familyId: string, memberId: string): Promise<void> {
  await updateDoc(doc(membersCollection(familyId), memberId), { isArchived: true });
}

/** Deletes the member outright and strips them from every meal's likedBy list. */
export async function deleteFamilyMember(familyId: string, memberId: string): Promise<void> {
  const mealsWithMember = query(
    collection(db, 'families', familyId, 'meals'),
    where('likedBy', 'array-contains', memberId)
  );
  const snap = await getDocs(mealsWithMember);

  const batch = writeBatch(db);
  snap.docs.forEach((mealDoc) => {
    batch.update(mealDoc.ref, { likedBy: arrayRemove(memberId) });
  });
  batch.delete(doc(membersCollection(familyId), memberId));
  await batch.commit();
}
