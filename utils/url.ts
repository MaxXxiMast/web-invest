import { postMessageToNativeOrFallback } from './appHelpers';

export const extractFilenameFromURL = (url) => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL:', url);
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    // Get the last segment of the path which is the filename
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return decodeURIComponent(filename);
  } catch (error) {
    console.error('Error extracting filename:', error);
    return '';
  }
};

export const downloadDocument = (url = '') => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL:', url);
    return;
  }

  const fileName = extractFilenameFromURL(url); // Replace with your desired file name

  const handleDownload = () => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectURL;
        link.style.display = 'none'; // Hide the link
        link.download = fileName;
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(objectURL);
      })
      .catch((error) => console.error('Error downloading file:', error));
  };
  postMessageToNativeOrFallback(
    'downloadAppDocument',
    {
      url: url,
      fileName,
    },
    handleDownload
  );
};
