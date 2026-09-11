import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { z } from 'zod';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

const MODEL = 'claude-opus-5';

// Mirrors MealIngredient/Meal shape closely enough for the client to map
// straight into it after the user reviews/edits (§7 — AI output is always a
// draft, never written to Firestore directly by this function).
const ParsedIngredientSchema = z.object({
  name: z.string().describe('Common ingredient name, e.g. "chicken breast"'),
  quantity: z.number(),
  unit: z
    .string()
    .describe('A short canonical unit: g, ml, unit, clove, tsp, tbsp, cup, etc.'),
  displayNote: z.string().nullable().describe('e.g. "diced", "ripe" — or null'),
});

const ParsedRecipeSchema = z.object({
  ingredients: z.array(ParsedIngredientSchema),
  steps: z.array(z.string()).describe('Short, generic cooking steps'),
});

type ParsedRecipe = z.infer<typeof ParsedRecipeSchema>;

function requireAuth(auth: { uid: string } | undefined): asserts auth {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Sign in to use recipe import.');
  }
}

async function parseRecipe(
  client: Anthropic,
  prompt: string
): Promise<ParsedRecipe> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: zodOutputFormat(ParsedRecipeSchema) },
  });

  if (!response.parsed_output) {
    throw new HttpsError('internal', 'Could not generate a structured recipe.');
  }
  return response.parsed_output;
}

/**
 * By-name import (§7): asks Claude for a generic, clearly-AI-generated
 * recipe. Never claims a specific named source — the client is expected to
 * label it "AI-generated" and let the user attach their own instructions
 * link separately if they have one.
 */
export const importRecipeByName = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    requireAuth(request.auth);

    const name = String(request.data?.name ?? '').trim();
    if (!name) {
      throw new HttpsError('invalid-argument', 'A meal name is required.');
    }
    const servings = Number(request.data?.servings) || 4;

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });
    const recipe = await parseRecipe(
      client,
      `Generate a home-cook-friendly recipe for "${name}" that serves ${servings} people. ` +
        'Give a structured ingredient list with realistic quantities in metric units ' +
        '(grams, millilitres) where the ingredient is normally measured that way, or a ' +
        'natural unit (clove, unit, tsp, tbsp, cup) otherwise. Keep ingredient names generic ' +
        'and commonly recognizable. Steps should be short and generic — do not invent a ' +
        'specific named source, author, or publication for this recipe.'
    );

    return { ...recipe, sourceType: 'ai-generated' as const };
  }
);

interface JsonLdRecipe {
  '@type'?: string | string[];
  name?: string;
  recipeIngredient?: string[];
}

function isRecipeNode(node: unknown): node is JsonLdRecipe {
  if (!node || typeof node !== 'object') return false;
  const type = (node as JsonLdRecipe)['@type'];
  return type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
}

/** Recursively hunts for a schema.org Recipe node inside a JSON-LD document
 *  (which may be a bare object, an array, or wrap nodes in @graph). */
function findRecipeNode(data: unknown): JsonLdRecipe | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === 'object') {
    if (isRecipeNode(data)) return data;
    const graph = (data as { '@graph'?: unknown })['@graph'];
    if (graph) return findRecipeNode(graph);
  }
  return null;
}

function extractRecipeFromHtml(html: string): JsonLdRecipe | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const recipe = findRecipeNode(parsed);
      if (recipe?.recipeIngredient?.length) return recipe;
    } catch {
      // Malformed JSON-LD block — skip it and keep looking.
    }
  }
  return null;
}

/**
 * By-URL import (§7): fetches the page server-side and reads its schema.org
 * Recipe markup (far more reliable than scraping visible text). We only ever
 * read the ingredient list out of it — never the instructions — and the
 * client stores just a link back to the original page.
 */
export const importRecipeByUrl = onCall(
  { secrets: [anthropicApiKey] },
  async (request) => {
    requireAuth(request.auth);

    const url = String(request.data?.url ?? '').trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new HttpsError('invalid-argument', 'A valid recipe URL is required.');
    }

    let html: string;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch {
      throw new HttpsError('unavailable', 'Could not fetch that page.');
    }

    const recipeNode = extractRecipeFromHtml(html);
    if (!recipeNode) {
      throw new HttpsError(
        'not-found',
        "This page doesn't publish structured recipe data we can read — try another " +
          'source, or add the ingredients manually.'
      );
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });
    const recipe = await parseRecipe(
      client,
      'Convert this raw ingredient list into structured data (do not invent or omit ' +
        `items, just parse quantity/unit/name/note out of each line):\n\n` +
        recipeNode.recipeIngredient!.map((line) => `- ${line}`).join('\n') +
        '\n\nReturn an empty steps array — we only need the ingredients from this source.'
    );

    return {
      ingredients: recipe.ingredients,
      steps: [] as string[],
      sourceType: 'imported-url' as const,
      sourceName: recipeNode.name ?? null,
    };
  }
);
