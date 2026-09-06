// The owner's public display preference; stored records retain their original provenance.
export const OWNER_DISPLAY_NAME = 'Mukhtada';
const OWNER_NAME_ALIASES = /\bMukhtada\s+(?:Billah\s+(?:Nasution|NST)|Nasution)\b/gi;

export function displayOwnerText(value) {
  return String(value ?? '').replace(OWNER_NAME_ALIASES, OWNER_DISPLAY_NAME);
}
