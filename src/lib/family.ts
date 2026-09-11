import { arrayUnion, collection, doc, getDoc, writeBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — easier to read aloud

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createFamily(uid: string, name: string): Promise<string> {
  const familyRef = doc(collection(db, 'families'));
  const inviteCode = generateInviteCode();

  const batch = writeBatch(db);
  batch.set(familyRef, {
    id: familyRef.id,
    name: name.trim(),
    memberIds: [uid],
    inviteCode,
    createdAt: Date.now(),
  });
  batch.set(doc(db, 'inviteCodes', inviteCode), { familyId: familyRef.id });
  batch.set(doc(db, 'users', uid), { familyId: familyRef.id }, { merge: true });
  await batch.commit();

  return familyRef.id;
}

export async function joinFamilyByCode(
  uid: string,
  rawCode: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: 'Enter an invite code.' };

  const inviteSnap = await getDoc(doc(db, 'inviteCodes', code));
  if (!inviteSnap.exists()) {
    return { ok: false, error: "That invite code doesn't match a family." };
  }
  const { familyId } = inviteSnap.data() as { familyId: string };

  const batch = writeBatch(db);
  batch.update(doc(db, 'families', familyId), { memberIds: arrayUnion(uid) });
  batch.set(doc(db, 'users', uid), { familyId }, { merge: true });
  await batch.commit();

  return { ok: true };
}
