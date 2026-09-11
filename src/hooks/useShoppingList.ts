import { useEffect, useState } from 'react';

import { subscribeShoppingList } from '@/lib/shoppingList';
import type { ShoppingListItem } from '@/types/models';

export function useShoppingList(familyId: string | undefined) {
  const [items, setItems] = useState<ShoppingListItem[] | null>(null);

  useEffect(() => {
    if (!familyId) {
      setItems(null);
      return;
    }
    return subscribeShoppingList(familyId, setItems);
  }, [familyId]);

  return items;
}
