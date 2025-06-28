import { useEffect, useState } from 'react';

const checkImage = async (url: string) => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (err) {
    console.error('Error checking image:', err);
    return false;
  }
};

const checkImageURL = async (imageUrl: string) => {
  const isValid = await checkImage(imageUrl);
  return isValid;
};

export const useImageLoader = (imageUrl: string) => {
  const [imageCheckResult, setImageCheckResult] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (typeof imageUrl === 'string') {
        try {
          const result = await checkImageURL(imageUrl);
          setImageCheckResult(result);
        } catch (error) {
          console.error('Error loading image:', error);
          setImageCheckResult(false);
        }
      }
    };
    loadImage();
  }, [imageUrl]);

  return imageCheckResult;
};
