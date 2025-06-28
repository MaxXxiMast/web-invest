import {
  isValidEmail,
  isValidMobile,
  isValidInternationalNumber,
  isMobileOrEmail,
  isValidName,
  capitalize,
  replaceAll,
  urlify,
  getUrlExtension,
  handleExtraProps,
  handleStringLimit,
  generateCountString,
  abbreviate,
  convertToUnderScoredType,
  checkEmailValidation,
  isContainSpecialCharacters,
  isOnlyNumbersRegex,
} from './string';

describe('String Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag+sorting@example.com')).toBe(true);
      expect(isValidEmail('x@x.au')).toBe(true);
    });

    it('should invalidate incorrect emails', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@@missingusername.com')).toBe(false);
      expect(isValidEmail('email.domain.com')).toBe(false);
      expect(isValidEmail('email@domain@domain.com')).toBe(false);
      expect(isValidEmail('email@111.222.333.44444')).toBe(false);
    });
  });

  describe('isValidMobile', () => {
    it('should validate Indian mobile numbers starting with 6-9', () => {
      expect(isValidMobile('9876543210')).toBe(true);
      expect(isValidMobile('6123456789')).toBe(true);
    });

    it('should invalidate incorrect mobile numbers', () => {
      expect(isValidMobile('1234567890')).toBe(false);
      expect(isValidMobile('987654321')).toBe(false);
      expect(isValidMobile('abcdefghij')).toBe(false);
      expect(isValidMobile('')).toBe(false);
      expect(isValidMobile(null as any)).toBe(false);
      expect(isValidMobile(undefined as any)).toBe(false);
    });
  });

  describe('isValidInternationalNumber', () => {
    it('should validate correct international numbers', () => {
      expect(isValidInternationalNumber('+123456789012')).toBe(true);
      expect(isValidInternationalNumber('+1 234 567 8901')).toBe(true);
      expect(isValidInternationalNumber('+44 20 7946 0958')).toBe(true);
    });

    it('should invalidate incorrect international numbers', () => {
      expect(isValidInternationalNumber('123456')).toBe(false);
      expect(isValidInternationalNumber('+123')).toBe(false);
      expect(isValidInternationalNumber('++1234567890')).toBe(false);
      expect(isValidInternationalNumber('+12 34 56')).toBe(false);
      expect(isValidInternationalNumber(null as any)).toBe(false);
      expect(isValidInternationalNumber(undefined as any)).toBe(false);
    });
  });

  describe('isMobileOrEmail', () => {
    it('should detect email', () => {
      expect(isMobileOrEmail('test@example.com')).toBe('email');
    });

    it('should detect mobile number', () => {
      expect(isMobileOrEmail('9876543210')).toBe('mobile');
    });

    it('should detect international number if flag is true', () => {
      expect(isMobileOrEmail('+123456789012', true)).toBe('mobile');
    });

    it('should not detect international number if flag is false', () => {
      expect(isMobileOrEmail('+123456789012', false)).toBe(null);
    });

    it('should return null for invalid input', () => {
      expect(isMobileOrEmail('invalid')).toBe(null);
      expect(isMobileOrEmail('')).toBe(null);
      expect(isMobileOrEmail('abc@com')).toBe(null);
      expect(isMobileOrEmail(null as any)).toBe(null);
      expect(isMobileOrEmail(undefined as any)).toBe(null);
    });
  });

  describe('isValidName', () => {
    it('should validate names with letters and spaces', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Alice')).toBe(true);
      expect(isValidName('A B C')).toBe(true);
    });

    it('should invalidate names with numbers or symbols', () => {
      expect(isValidName('John123')).toBe(false);
      expect(isValidName('John_Doe')).toBe(false);
      expect(isValidName('John-Doe')).toBe(false);
      expect(isValidName('!@#')).toBe(false);
      expect(isValidName('Alice123')).toBe(false);
      //   expect(isValidName(undefined as any)).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of the string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should return the original value if input is empty or null', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null as any)).toBe(null);
      expect(capitalize(undefined as any)).toBe(undefined);
    });

    it('should not change string if already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character input', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('A')).toBe('A');
    });

    it('should handle whitespace-only string', () => {
      expect(capitalize('   ')).toBe('   ');
    });
  });
});

describe('replaceAll', () => {
  it('should replace all occurrences of substring', () => {
    expect(replaceAll('foo bar foo', 'foo', 'baz')).toBe('baz bar baz');
  });
});
describe('urlify', () => {
  it('should replace spaces with hyphens and remove special characters', () => {
    expect(urlify('My Page (2021)')).toBe('my-page-2021');
  });
});
describe('getUrlExtension', () => {
  it('should extract extension from URL with query and hash', () => {
    expect(
      getUrlExtension('http://example.com/file.pdf?version=1#anchor')
    ).toBe('pdf');
  });

  it('should return false for empty string', () => {
    expect(getUrlExtension('')).toBe(false);
  });
});
describe('handleExtraProps', () => {
  it('should return the prop name if valid', () => {
    expect(handleExtraProps('title')).toBe('title');
  });

  it('should return empty string if prop name is blank', () => {
    expect(handleExtraProps('')).toBe('');
  });
});
describe('handleStringLimit', () => {
  it('should truncate string with ellipsis if exceeds charCount', () => {
    expect(handleStringLimit('Hello World', 5)).toBe('Hello...');
  });

  it('should return full string if within limit', () => {
    expect(handleStringLimit('Hello', 10)).toBe('Hello');
  });

  it('should return original string if charCount not provided', () => {
    expect(handleStringLimit('Hello')).toBe('Hello');
  });
});
describe('generateCountString', () => {
  it('should prefix with 0 if number is between 1 and 9', () => {
    expect(generateCountString(5)).toBe('05');
  });

  it('should return number as string if >= 10', () => {
    expect(generateCountString(12)).toBe('12');
  });
});
describe('Additional String Utilities', () => {
  describe('getUrlExtension', () => {
    it('should extract file extension from URL', () => {
      expect(getUrlExtension('http://example.com/file.pdf')).toBe('pdf');
      expect(
        getUrlExtension('https://example.com/folder/image.png?query=1')
      ).toBe('png');
      expect(getUrlExtension('https://example.com/video.mp4#fragment')).toBe(
        'mp4'
      );
    });

    it('should return false for empty URL', () => {
      expect(getUrlExtension('')).toBe(false);
    });
  });

  describe('handleExtraProps', () => {
    it('should return the string if non-empty and trimmed', () => {
      expect(handleExtraProps(' test ')).toBe(' test ');
      expect(handleExtraProps('')).toBe('');
    });
  });

  describe('handleStringLimit', () => {
    it('should return truncated string with ellipsis if over charCount', () => {
      expect(handleStringLimit('HelloWorld', 5)).toBe('Hello...');
      expect(handleStringLimit('Hello', 10)).toBe('Hello');
    });
  });

  describe('abbreviate', () => {
    it('should return initials of words', () => {
      expect(abbreviate('Open AI GPT')).toBe('OAG');
      expect(abbreviate('  Multiple   Spaces  ')).toBe('MS');
    });
  });

  describe('convertToUnderScoredType', () => {
    it('should convert space-separated words to underscored uppercase', () => {
      expect(convertToUnderScoredType('test case')).toBe('TEST_CASE');
      expect(convertToUnderScoredType('Single')).toBe('Single');
    });
  });

  describe('checkEmailValidation', () => {
    it('should validate email format using custom regex', () => {
      expect(checkEmailValidation('example@domain.com')).toBe(true);
      expect(checkEmailValidation('invalid@@example')).toBe(false);
    });
  });

  describe('isContainSpecialCharacters', () => {
    it('should detect special characters in a string', () => {
      expect(isContainSpecialCharacters.test('Hello@')).toBe(true);
      expect(isContainSpecialCharacters.test('Hello')).toBe(false);
    });
  });

  describe('isOnlyNumbersRegex', () => {
    it('should detect only numbers', () => {
      expect(isOnlyNumbersRegex.test('123456')).toBe(true);
      expect(isOnlyNumbersRegex.test('123abc')).toBe(false);
    });
  });
});
