import { useEffect, useState } from 'react';

import { subscribeFamilyMembers } from '@/lib/familyMembers';
import type { FamilyMember } from '@/types/models';

export function useFamilyMembers(familyId: string | undefined) {
  const [members, setMembers] = useState<FamilyMember[] | null>(null);

  useEffect(() => {
    if (!familyId) {
      setMembers(null);
      return;
    }
    return subscribeFamilyMembers(familyId, setMembers);
  }, [familyId]);

  return members;
}
