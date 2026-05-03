export interface Banner {
  id: string;
  title: string;
  image: string;
  position: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}