export type Property = {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  city: string;
  location: string;
  propertyType: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PropertyList = {
  items: Property[];
  nextCursor: string | null;
};
