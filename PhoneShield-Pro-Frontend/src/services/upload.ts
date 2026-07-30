import { api } from "./api";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 * Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upload image");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadImages(files: File[]): Promise<UploadedImage[]> {
  const uploads = files.map((file) => uploadImage(file));
  return Promise.all(uploads);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing.");
  }

  // Note: Deletion requires server-side implementation with API secret
  // This is a placeholder for client-side deletion logic
  console.warn("Image deletion requires server-side implementation");
}