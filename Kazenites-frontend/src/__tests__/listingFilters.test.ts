import { applyFilterSort, type ListingFilters } from '../utils/listingFilters';
import type { Listing } from '../types';

const base: Listing[] = [
  { id: 1, title: 'Blueberry', price: 5, city: 'Vilnius', categoryId: 10, status: 'APPROVED', createdAt: '2024-01-02T00:00:00Z' },
  { id: 2, title: 'Strawberry', price: 3, city: 'Kaunas', categoryId: 11, status: 'APPROVED', createdAt: '2024-01-03T00:00:00Z' },
  { id: 3, title: 'Raspberry', price: 7, city: 'Vilnius', categoryId: 10, status: 'PENDING', createdAt: '2024-01-01T00:00:00Z' },
];

describe('applyFilterSort', () => {
  it('filters by category and city and price range', () => {
    const filters: ListingFilters = { categoryId: 10, city: 'Vilnius', priceMin: 4, priceMax: 6 };
    const out = applyFilterSort(base, filters, 'PRICE_ASC');
    expect(out.map(x => x.id)).toEqual([1]);
  });

  it('sorts by price descending', () => {
    const out = applyFilterSort(base, {}, 'PRICE_DESC');
    expect(out.map(x => x.id)).toEqual([3, 1, 2]);
  });

  it('sorts by title ascending', () => {
    const out = applyFilterSort(base, {}, 'TITLE_ASC');
    expect(out.map(x => x.title)).toEqual(['Blueberry', 'Raspberry', 'Strawberry']);
  });

  // status filter removed per request
});
