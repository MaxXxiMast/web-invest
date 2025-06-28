import { htmlSanitizer } from './htmlSanitizer';
import dompurify from 'dompurify';

jest.mock('dompurify', () => ({
  sanitize: jest.fn(),
}));

describe('htmlSanitizer', () => {
  it('calls dompurify.sanitize with correct config', () => {
    const html =
      '<div><iframe src="https://example.com" allowfullscreen></iframe></div>';

    htmlSanitizer(html);

    expect(dompurify.sanitize).toHaveBeenCalledWith(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: [
        'allow',
        'allowfullscreen',
        'frameborder',
        'scrolling',
        'target',
      ],
    });
  });

  it('returns sanitized HTML output from dompurify', () => {
    (dompurify.sanitize as jest.Mock).mockReturnValue('<div>Safe</div>');

    const result = htmlSanitizer('<div>unsafe<script></script></div>');
    expect(result).toBe('<div>Safe</div>');
  });

  it('handles empty input gracefully', () => {
    (dompurify.sanitize as jest.Mock).mockReturnValue('');
    const result = htmlSanitizer('');
    expect(result).toBe('');
  });

  it('handles malformed input', () => {
    (dompurify.sanitize as jest.Mock).mockReturnValue('<p>Oops</p>');
    const result = htmlSanitizer('<p><b>Oops');
    expect(result).toBe('<p>Oops</p>');
  });
});
