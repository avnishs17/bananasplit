
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createThumbnail = (imageDataUrl: string, size = 128): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      const aspectRatio = img.width / img.height;
      let width = size;
      let height = size;

      if (aspectRatio > 1) { // Landscape
        height = size / aspectRatio;
      } else { // Portrait or square
        width = size * aspectRatio;
      }
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller thumbnail size
    };
    img.onerror = (err) => reject(new Error('Failed to load image for thumbnail creation.'));
    img.src = imageDataUrl;
  });
};
