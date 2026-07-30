import { api } from "./api";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image using backend upload endpoints
 */
export async function uploadImage(file: File, type: 'phone' | 'seller' | 'customer' | 'repair'): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/upload/${type}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = response.data;
  if (!data.success || !data.images || data.images.length === 0) {
    throw new Error(data.message || "Failed to upload image");
  }

  const imageUrl = data.images[0];
  return {
    url: imageUrl,
    publicId: "",
    width: 0,
    height: 0,
    format: "",
  };
}

/**
 * Upload multiple images using backend upload endpoints
 */
export async function uploadImages(files: File[], type: 'phone' | 'seller' | 'customer' | 'repair'): Promise<UploadedImage[]> {
  const uploads = files.map((file) => uploadImage(file, type));
  return Promise.all(uploads);
}