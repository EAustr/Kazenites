import type { Listing, ListingUnit, Category } from '../types';

export type SortOption =
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'TITLE_ASC'
  | 'TITLE_DESC'
  | 'NEWEST'
  | 'OLDEST';

export type ListingFilters = {
  categoryId?: number | null;
  city?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  unit?: ListingUnit | null;
};

const normalize = (s?: string | null) => (s ? s.trim().toLowerCase() : '');

export function applyFilterSort(
  listings: Listing[],
  filters: ListingFilters,
  sort: SortOption,
): Listing[] {
  const {
    categoryId = null,
    city = null,
    priceMin = null,
    priceMax = null,
    unit = null,
  } = filters || {};

  let out = listings.filter(l => {
    if (categoryId != null && l.categoryId !== categoryId) return false;
    if (city && normalize(l.city) !== normalize(city)) return false;
    if (unit && l.unit !== unit) return false;
    if (priceMin != null && typeof l.price === 'number' && l.price < priceMin)
      return false;
    if (priceMax != null && typeof l.price === 'number' && l.price > priceMax)
      return false;
    return true;
  });

  switch (sort) {
    case 'PRICE_ASC':
      out = [...out].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case 'PRICE_DESC':
      out = [...out].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case 'TITLE_ASC':
      out = [...out].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, {
          sensitivity: 'base',
        }),
      );
      break;
    case 'TITLE_DESC':
      out = [...out].sort((a, b) =>
        (b.title || '').localeCompare(a.title || '', undefined, {
          sensitivity: 'base',
        }),
      );
      break;
    case 'NEWEST': {
      out = [...out].sort((a, b) => {
        const da = a.createdAt ? Date.parse(a.createdAt) : 0;
        const db = b.createdAt ? Date.parse(b.createdAt) : 0;
        return db - da;
      });
      break;
    }
    case 'OLDEST': {
      out = [...out].sort((a, b) => {
        const da = a.createdAt ? Date.parse(a.createdAt) : 0;
        const db = b.createdAt ? Date.parse(b.createdAt) : 0;
        return da - db;
      });
      break;
    }
    default:
      break;
  }

  return out;
}

export function uniqueCities(listings: Listing[]): string[] {
  const set = new Set<string>();
  listings.forEach(l => {
    if (l.city) set.add(l.city);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
