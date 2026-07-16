const DIACRITICS_PATTERN = '[\\u0300-\\u036f]'
const DIACRITICS = new RegExp(DIACRITICS_PATTERN, 'g')

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
