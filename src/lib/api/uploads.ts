import { apiFetch } from "./http";

export interface UploadImageResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export function adminUploadImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadImageResult>("/admin/uploads/images", {
    method: "POST",
    token,
    body: formData,
  });
}

export function adminDeleteImage(token: string, publicId: string) {
  return apiFetch<{ success: boolean }>("/admin/uploads/images", {
    method: "DELETE",
    token,
    body: { publicId },
  });
}
