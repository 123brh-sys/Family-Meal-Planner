import { useRouter } from 'expo-router';

import { MealForm } from '@/components/MealForm';
import { useFamily } from '@/context/FamilyContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { createMeal } from '@/lib/meals';

export default function NewMeal() {
  const { family } = useFamily();
  const members = useFamilyMembers(family?.id);
  const router = useRouter();

  if (!family || members === null) return null;

  return (
    <MealForm
      familyMembers={members}
      submitLabel="Save meal"
      onSubmit={async (input) => {
        const id = await createMeal(family.id, input);
        router.replace(`/meal/${id}`);
      }}
    />
  );
}
