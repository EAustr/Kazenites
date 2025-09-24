export type Category = {
  id: number;
  name: string;
  parentId?: number | null;
};

export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Listing = {
  id: number;
  title: string;
  description?: string | null;
  price: number;
  city?: string | null;
  categoryId: number;
  status: ListingStatus;
  createdAt?: string;
  updatedAt?: string;
};
