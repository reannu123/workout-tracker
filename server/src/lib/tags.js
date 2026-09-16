export const TAG_COLORS = ["emerald", "blue", "violet", "amber", "rose", "cyan"];
export const MAX_TAGS_PER_SESSION = 5;
export const MAX_TAG_NAME_LENGTH = 24;

function tagError(message) {
  const error = new Error(message);
  error.code = "TAG_VALIDATION";
  return error;
}

export function normalizeTagName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function normalizeTags(input) {
  if (input == null) return [];
  if (!Array.isArray(input)) throw tagError("Tags must be an array.");

  const tags = [];
  const seen = new Set();

  for (const item of input) {
    const name = normalizeTagName(typeof item === "string" ? item : item?.name);
    if (!name) continue;
    if (name.length > MAX_TAG_NAME_LENGTH) {
      throw tagError(`Tag names must be ${MAX_TAG_NAME_LENGTH} characters or fewer.`);
    }

    const normalizedName = name.toLocaleLowerCase("en-US");
    if (seen.has(normalizedName)) continue;
    seen.add(normalizedName);

    const requestedColor = typeof item === "object" ? item?.color : null;
    const color = TAG_COLORS.includes(requestedColor) ? requestedColor : TAG_COLORS[0];
    tags.push({ name, normalizedName, color });
  }

  if (tags.length > MAX_TAGS_PER_SESSION) {
    throw tagError(`Add no more than ${MAX_TAGS_PER_SESSION} tags to a workout.`);
  }

  return tags;
}

export async function resolveTags(tx, input) {
  const tags = normalizeTags(input);
  const resolved = [];

  for (const tag of tags) {
    resolved.push(
      await tx.workoutTag.upsert({
        where: { normalizedName: tag.normalizedName },
        update: {},
        create: tag,
      })
    );
  }

  return resolved;
}
