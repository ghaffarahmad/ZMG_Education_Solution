export const MALE_FALLBACK_NAMES = ["Muhammad S****", "Ahmed R****", "Bilal K****", "Hassan A****"];
export const FEMALE_FALLBACK_NAMES = ["Ayesha F****", "Hina A****", "Maryam K****", "Fatima R****"];

const MAX_PUBLIC_NAMES = 6;

function toTitleCaseWord(word: string) {
  const characters = Array.from(word.toLocaleLowerCase("en-US"));
  const firstCharacter = characters[0];

  if (!firstCharacter) return "";

  return `${firstCharacter.toLocaleUpperCase("en-US")}${characters.slice(1).join("")}`;
}

function getInitial(word: string) {
  return Array.from(word).find((character) => /[a-z]/i.test(character))?.toLocaleUpperCase("en-US") || "";
}

// Only masked display names are returned publicly. No sensitive student data is exposed.
export function maskStudentDisplayName(rawName: unknown) {
  if (typeof rawName !== "string") return null;

  const words = rawName.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const firstName = toTitleCaseWord(words[0] || "");
  const secondName = words[1];

  if (!firstName) return null;
  if (!secondName) return `${firstName} ****`;

  const secondInitial = getInitial(secondName);
  if (!secondInitial) return `${firstName} ****`;

  return `${firstName} ${secondInitial}****`;
}

export function coerceMaskedStudentDisplayName(publicName: unknown) {
  if (typeof publicName !== "string") return null;

  const cleanedName = publicName.trim().replace(/\s+/g, " ");
  if (!cleanedName) return null;

  return maskStudentDisplayName(cleanedName);
}

export function normalizeMaskedStudentNames(
  names: unknown[],
  fallbackNames: string[],
  limit = MAX_PUBLIC_NAMES
) {
  const uniqueNames = new Set<string>();

  for (const name of names) {
    const maskedName = maskStudentDisplayName(name);
    if (maskedName) uniqueNames.add(maskedName);
    if (uniqueNames.size >= limit) break;
  }

  const maskedNames = Array.from(uniqueNames);
  return maskedNames.length > 0 ? maskedNames : fallbackNames.slice(0, limit);
}

export function normalizePublicMaskedStudentNames(
  names: unknown[],
  fallbackNames: string[],
  limit = MAX_PUBLIC_NAMES
) {
  const uniqueNames = new Set<string>();

  for (const name of names) {
    const maskedName = coerceMaskedStudentDisplayName(name);
    if (maskedName) uniqueNames.add(maskedName);
    if (uniqueNames.size >= limit) break;
  }

  const maskedNames = Array.from(uniqueNames);
  return maskedNames.length > 0 ? maskedNames : fallbackNames.slice(0, limit);
}
