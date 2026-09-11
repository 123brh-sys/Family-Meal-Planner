import { useEffect, useState } from 'react';

import { subscribeMeals } from '@/lib/meals';
import type { Meal } from '@/types/models';

export function useMeals(familyId: string | undefined) {
  const [meals, setMeals] = useState<Meal[] | null>(null);

  useEffect(() => {
    if (!familyId) {
      setMeals(null);
      return;
    }
    return subscribeMeals(familyId, setMeals);
  }, [familyId]);

  return meals;
}
