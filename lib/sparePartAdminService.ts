import api from './api';
import { IAsset, ISpecification } from './productAdminService';

export interface ISparePart {
  _id: string;
  name: string;
  slug: string;
  brand: string | { _id: string; name: string; logo?: IAsset };
  category: string | { _id: string; name: string };
  product: string | { _id: string; name: string; slug?: string };
  modelNumber: string;
  compatibleModels?: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  specifications: ISpecification[];
  features: string[];
  warranty: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  stockQuantity: number;
  thumbnail: IAsset;
  images: IAsset[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISparePartsResponse {
  success: boolean;
  message: string;
  data: {
    spareParts: ISparePart[];
    total: number;
  };
}

export interface ISingleSparePartResponse {
  success: boolean;
  message: string;
  data: {
    sparePart: ISparePart;
  };
}

export interface ISparePartQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  product?: string;
  status?: string;
  sort?: string;
}

export const sparePartAdminService = {
  /**
   * Get all spare parts with pagination, search, sorting, and filters.
   */
  getAllSpareParts: async (params?: ISparePartQueryParams): Promise<ISparPartsResponseWrapper> => {
    // Note: The backend route is /spare-parts, handles pagination and query parameters.
    const response = await api.get<ISparePartsResponse>('/spare-parts', { params });
    return response.data;
  },

  /**
   * Get a single spare part details by its unique slug.
   */
  getSparePartBySlug: async (slug: string): Promise<ISingleSparePartResponse> => {
    const response = await api.get<ISingleSparePartResponse>(`/spare-parts/${slug}`);
    return response.data;
  },

  /**
   * Create a new spare part.
   * Expects a FormData object containing text fields and file attachments.
   */
  createSparePart: async (formData: FormData): Promise<ISingleSparePartResponse> => {
    const response = await api.post<ISingleSparePartResponse>('/spare-parts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing spare part by its ID.
   * Expects a FormData object (files are optional).
   * Attempts PATCH first, falling back to PUT if needed.
   */
  updateSparePart: async (id: string, formData: FormData): Promise<ISingleSparePartResponse> => {
    try {
      const response = await api.patch<ISingleSparePartResponse>(`/spare-parts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('PATCH failed, falling back to PUT update', error);
      const response = await api.put<ISingleSparePartResponse>(`/spare-parts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  },

  /**
   * Delete a spare part by its ID.
   */
  deleteSparePart: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/spare-parts/${id}`);
    return response.data;
  },
};

// Define wrapper just in case naming compatibility varies
type ISparPartsResponseWrapper = ISparePartsResponse;
