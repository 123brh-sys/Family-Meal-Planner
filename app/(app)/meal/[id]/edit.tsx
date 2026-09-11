import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { MealForm } from '@/components/MealForm';
import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { getMeal, updateMeal } from '@/lib/meals';
import type { Meal } from '@/types/models';

export default function EditMeal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { family } = useFamily();
  const members = useFamilyMembers(family?.id);
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null | undefined>(undefined);

  useEffect(() => {
    if (!family) return;
    getMeal(family.id, id).then(setMeal);
  }, [family, id]);

  if (!family || meal === undefined || meal === null || members === null) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <MealForm
      familyMembers={members}
      initialMeal={meal}
      submitLabel="Save changes"
      onSubmit={async (input) => {
        await updateMeal(family.id, meal.id, input);
        router.back();
      }}
    />
  );
}
