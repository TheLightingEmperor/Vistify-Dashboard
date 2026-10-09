import raw from "@/data/vistify.json";

export interface Restaurant {
  chain: string;
  verdict: string;
  difficulty: string;
  photos: string;
  units: string;
  segment: string;
  angle: string;
  source: string;
}
export interface Contact {
  company: string;
  name: string;
  title: string;
  email: string;
  phone: string;
}
export interface SampleEmail {
  brand: string;
  body: string;
}
export interface DroppedChain {
  chain: string;
  verdict: string;
  photos: string;
}
export interface ReadMe {
  title: string;
  byline: string;
  sections: { heading: string; lines: string[] }[];
}
interface VistifyData {
  sheets: { readMe: string; dropped: string };
  hiddenLabel: string;
  headers: { restaurants: string[]; contacts: string[]; dropped: string[] };
  restaurants: Restaurant[];
  contacts: Contact[];
  emails: SampleEmail[];
  readMe: ReadMe;
  dropped: DroppedChain[];
}

/** Everything below is generated from the workbook by `npm run data`. */
export const data = raw as VistifyData;

/** Normalised key so "Bush's" and "Bush’s" (or stray spacing) still link up across sheets. */
export const companyKey = (name: string) =>
  name.toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim();

function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return map;
}

export const contactsByCompany = groupBy(data.contacts, (c) => companyKey(c.company));
export const emailsByBrand = groupBy(data.emails, (e) => companyKey(e.brand));
export const restaurantsByKey = new Map(data.restaurants.map((r) => [companyKey(r.chain), r]));

export const contactCount = (company: string) => contactsByCompany.get(companyKey(company))?.length ?? 0;
export const hasEmail = (company: string) => emailsByBrand.has(companyKey(company));
export const isRestaurant = (name: string) => restaurantsByKey.has(companyKey(name));

export function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** First number in strings like "~1,000+" or "~180–190", used for sorting only. */
export function unitsValue(units: string) {
  const m = units.replace(/,/g, "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}
