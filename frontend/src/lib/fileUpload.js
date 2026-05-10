const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      return reject(new Error('Only PNG, JPG/JPEG, and WEBP images are allowed.'));
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return reject(new Error('Image size must be 2MB or smaller.'));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}
//