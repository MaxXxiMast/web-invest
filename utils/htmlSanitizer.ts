import dompurify from 'dompurify';

export const htmlSanitizer = (htmlContent: string) => {
  const sanitizer = dompurify.sanitize;
  return sanitizer(htmlContent, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'target',
    ],
  });
};
