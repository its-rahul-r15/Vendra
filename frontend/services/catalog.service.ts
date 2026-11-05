import { api } from './api';

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  iconUrl?: string;
  vertical?: string;
  parentId?: string | null;
  sortOrder?: number;
  order?: number;
  isActive?: boolean;
  description?: string;
  subcategories?: CategoryTreeNode[];
}

export const catalogService = {
  async getCategoriesTree(vertical?: string): Promise<CategoryTreeNode[]> {
    const params = vertical ? { vertical } : {};
    const response = await api.get<any>('/catalog/categories/tree', { params });
    const d = response.data?.data;
    if (Array.isArray(d)) return d;
    return d?.categories || [];
  },

  async getCategories(vertical?: string): Promise<CategoryTreeNode[]> {
    const params = vertical ? { vertical } : {};
    const response = await api.get<any>('/catalog/categories', { params });
    const d = response.data?.data;
    if (Array.isArray(d)) return d;
    return d?.categories || [];
  },
};

