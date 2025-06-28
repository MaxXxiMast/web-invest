import { identifyClarityUser } from './clarity';
import { newRelicErrorLog } from './gtm';

jest.mock('./gtm', () => ({
  newRelicErrorLog: jest.fn(),
}));

describe('identifyClarityUser', () => {
  beforeEach(() => {
    // Reset global window.clarity
    // @ts-ignore
    delete window.clarity;
    jest.clearAllMocks();
  });

  it('should call clarity with user ID if clarity is available', () => {
    const mockClarity = jest.fn();
    // @ts-ignore
    window.clarity = mockClarity;

    identifyClarityUser('abc123');
    expect(mockClarity).toHaveBeenCalledWith('identify', 'abc123');
  });

  it('should do nothing if clarity is not available', () => {
    // No window.clarity defined
    identifyClarityUser('abc123');
    expect(newRelicErrorLog).not.toHaveBeenCalled();
  });

  it('should log to newRelicErrorLog if clarity throws error', () => {
    // @ts-ignore
    window.clarity = () => {
      throw { message: 'Clarity failed' };
    };

    identifyClarityUser(123);

    expect(newRelicErrorLog).toHaveBeenCalledWith(
      expect.stringContaining('Clarity failed')
    );
  });
});

