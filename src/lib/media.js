export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 1600;

export function readBlobAsDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize/compress images before upload to keep payloads Cloudinary-friendly.
 */
export function compressImageFile(file, maxWidth = MAX_IMAGE_DIMENSION, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Please choose an image file (JPG, PNG, GIF, or WebP)."));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("Image is too large. Maximum size is 5 MB."));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const outputType =
        file.type === "image/png" || file.type === "image/webp"
          ? file.type
          : "image/jpeg";

      resolve(canvas.toDataURL(outputType, quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };

    img.src = url;
  });
}

export async function blobToUploadDataURL(blob) {
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error("Voice message is too large. Maximum size is 8 MB.");
  }
  return readBlobAsDataURL(blob);
}
