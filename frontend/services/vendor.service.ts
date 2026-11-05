import { api } from './api';

export interface SellerApplicationPayload {
  businessName: string;
  businessType: 'restaurant' | 'grocery' | 'both';
  ownerName: string;
  businessPhone: string;
  businessEmail: string;
  gstNumber?: string;
  fssaiNumber?: string;
  businessAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface VendorApplication {
  _id: string;
  name: string;
  approval: {
    status: 'pending' | 'approved' | 'rejected';
    adminNote?: string;
    reviewedAt?: string;
  };
  sellerApplication?: {
    businessName: string;
    businessType: string;
    ownerName: string;
    businessPhone: string;
    businessEmail: string;
    gstNumber?: string;
    fssaiNumber?: string;
    businessAddress: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    };
    submittedAt?: string;
  };
  ownerId?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
}

export const vendorService = {
  async applyAsSeller(data: SellerApplicationPayload): Promise<VendorApplication> {
    const response = await api.post<{ success: boolean; data: { vendor: VendorApplication } }>(
      '/vendors/apply',
      data
    );
    return response.data.data.vendor;
  },

  async getMyApplication(): Promise<VendorApplication | null> {
    try {
      const response = await api.get<{ success: boolean; data: { vendor: VendorApplication | null } }>(
        '/vendors/my/application'
      );
      return response.data.data.vendor;
    } catch {
      return null;
    }
  },
};

export const catalogService = {
  async getCategoriesTree(vertical?: string): Promise<any[]> {
    const params = vertical ? { vertical } : {};
    const response = await api.get<{ success: boolean; data: { categories: any[] } }>(
      '/catalog/categories/tree',
      { params }
    );
    // Handle both response shapes
    const d = response.data.data;
    if (Array.isArray(d)) return d;
    return d?.categories || [];
  },

  async getCategories(vertical?: string): Promise<any[]> {
    const params = vertical ? { vertical } : {};
    const response = await api.get<any>('/catalog/categories', { params });
    const d = response.data.data;
    if (Array.isArray(d)) return d;
    return d?.categories || [];
  },
};
