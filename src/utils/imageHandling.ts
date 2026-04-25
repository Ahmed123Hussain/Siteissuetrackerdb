/**
 * Compress image and generate thumbnail
 */
export const processImage = (file: File): Promise<{ data: string; thumbnail: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Convert original to base64
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const data = canvas.toDataURL('image/jpeg', 0.8);

          // Create thumbnail (150x150)
          const thumbCanvas = document.createElement('canvas');
          const size = 150;
          thumbCanvas.width = size;
          thumbCanvas.height = size;
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            // Fill with white background
            thumbCtx.fillStyle = '#ffffff';
            thumbCtx.fillRect(0, 0, size, size);

            // Calculate dimensions to fit in square
            const scale = Math.min(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;

            thumbCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
            const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);
            resolve({ data, thumbnail });
          }
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const downloadImageAsFile = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
