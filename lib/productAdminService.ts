import api from './api';

export interface ISpecification {
  key: string;
  value: string;
}

export interface IAsset {
  url: string;
  publicId: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  brand: string | { _id: string; name: string; logo?: IAsset };
  category: string | { _id: string; name: string };
  modelNumber: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  specifications: ISpecification[];
  features: string[];
  warranty: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  thumbnail: IAsset;
  images: IAsset[];
  brochure?: IAsset;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: IProduct[];
    total: number;
  };
}

export interface ISingleProductResponse {
  success: boolean;
  message: string;
  data: {
    product: IProduct;
  };
}

export interface IProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  status?: string;
  sort?: string;
}

export const productAdminService = {
  /**
   * Get all products with pagination, search, sorting, and filters.
   */
  getAllProducts: async (params?: IProductQueryParams): Promise<IProductsResponse> => {
    const response = await api.get<IProductsResponse>('products', { params });
    return response.data;
  },

  /**
   * Get a single product details by its unique slug.
   */
  getProductBySlug: async (slug: string): Promise<ISingleProductResponse> => {
    const response = await api.get<ISingleProductResponse>(`products/${slug}`);
    return response.data;
  },

  /**
   * Create a new product.
   * Expects a FormData object containing text fields and file attachments.
   */
  createProduct: async (formData: FormData): Promise<ISingleProductResponse> => {
    const response = await api.post<ISingleProductResponse>('products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing product by its ID.
   * Expects a FormData object (files are optional).
   */
  updateProduct: async (id: string, formData: FormData): Promise<ISingleProductResponse> => {
    const response = await api.put<ISingleProductResponse>(`products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a product by its ID (soft delete on the backend).
   */
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`products/${id}`);
    return response.data;
  },
};
