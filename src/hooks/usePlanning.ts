import { useEffect, useState } from 'react';

import { subscribePlanning, type Planning } from '@/lib/planning';

export function usePlanning(familyId: string | undefined) {
  const [planning, setPlanning] = useState<Planning | null>(null);

  useEffect(() => {
    if (!familyId) {
      setPlanning(null);
      return;
    }
    return subscribePlanning(familyId, setPlanning);
  }, [familyId]);

  return planning;
}
