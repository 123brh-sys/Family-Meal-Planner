// A sensible starter list of ingredients most kitchens already stock (§10).
// New canonical ingredients are auto-flagged as pantry items when their name
// matches one of these — still just a default, editable per-ingredient after.
const DEFAULT_PANTRY_NAMES = new Set([
  'salt',
  'black pepper',
  'pepper',
  'olive oil',
  'vegetable oil',
  'sunflower oil',
  'cooking oil',
  'butter',
  'flour',
  'plain flour',
  'self-raising flour',
  'sugar',
  'brown sugar',
  'caster sugar',
  'baking powder',
  'baking soda',
  'bicarbonate of soda',
  'garlic powder',
  'onion powder',
  'soy sauce',
  'vinegar',
  'white vinegar',
  'stock cube',
  'chicken stock cube',
  'vegetable stock cube',
  'rice',
  'pasta',
  'ketchup',
  'mustard',
  'mayonnaise',
  'honey',
  'vanilla extract',
  'cinnamon',
  'paprika',
  'cumin',
  'dried oregano',
  'dried basil',
  'bay leaves',
  'water',
]);

export function isDefaultPantryIngredient(name: string): boolean {
  return DEFAULT_PANTRY_NAMES.has(name.trim().toLowerCase());
}
