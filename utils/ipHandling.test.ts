import { setIpData, getIpData, deleteIpData } from './ipHandling';

global.fetch = jest.fn();

const mockSessionStorage: Record<string, string> = {};

beforeEach(() => {
  (fetch as jest.Mock).mockReset();
  Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
  // Mock sessionStorage
  Object.defineProperty(global, 'sessionStorage', {
    value: {
      getItem: (key: string) => mockSessionStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockSessionStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockSessionStorage[key];
      },
    },
    writable: true,
    
  });
});

describe('IP Handling Utils', () => {
  it('should store correct IP data when all fields are present', async () => {
    const mockData = {
      timezone: 'Asia/Kolkata',
      ip: '123.123.123.123',
      country_name: 'India',
      region: 'Delhi',
      city: 'New Delhi',
      org: 'Test ISP',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockData,
    });

    await setIpData();
    const stored = JSON.parse(getIpData());

    expect(stored).toEqual({
      timezone: 'Asia/Kolkata',
      'IP Address': '123.123.123.123',
      Country: 'India',
      region: 'Delhi',
      City: 'New Delhi',
      isp: 'Test ISP',
    });
  });

  it('should store "Unknown" for missing fields', async () => {
    const partialMockData = {
      timezone: undefined,
      ip: undefined,
      // missing others
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => partialMockData,
    });

    await setIpData();
    const stored = JSON.parse(getIpData());

    expect(stored).toEqual({
      timezone: 'Unknown',
      'IP Address': 'Unknown',
      Country: 'Unknown',
      region: 'Unknown',
      City: 'Unknown',
      isp: 'Unknown',
    });
  });

  it('should return empty string if no IP data in sessionStorage', () => {
    expect(getIpData()).toBe('');
  });

  it('should remove IP data from sessionStorage', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        timezone: 'Asia/Kolkata',
        ip: '123.123.123.123',
        country_name: 'India',
        region: 'Delhi',
        city: 'New Delhi',
        org: 'Test ISP',
      }),
    });

    await setIpData();
    deleteIpData();
    expect(getIpData()).toBe('');
  });

  it('should catch error during fetch', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API failed'));

    await setIpData();

    expect(consoleSpy).toHaveBeenCalledWith('>>>Error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should store "Unknown" for each individual missing field', async () => {
  const mockData = {
    timezone: undefined,
    ip: undefined,
    country_name: undefined,
    region: undefined,
    city: undefined,
    org: undefined,
  };

  (fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => mockData,
  });

  await setIpData();

  const stored = JSON.parse(getIpData());

  expect(stored).toEqual({
    timezone: 'Unknown',
    'IP Address': 'Unknown',
    Country: 'Unknown',
    region: 'Unknown',
    City: 'Unknown',
    isp: 'Unknown',
  });
});
it('should fallback "timezone" to Unknown when missing', async () => {
  const mockData = {
    ip: '123.123.123.123',
    country_name: 'India',
    region: 'Delhi',
    city: 'New Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => mockData,
  });

  await setIpData();

  const stored = JSON.parse(getIpData());
  expect(stored.timezone).toBe('Unknown');
});



it('should fallback to Unknown if timezone is missing', async () => {
  const mockData = {
    ip: '123.123.123.123',
    country_name: 'India',
    region: 'Delhi',
    city: 'New Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData()).timezone).toBe('Unknown');
});

it('should fallback to Unknown if ip is missing', async () => {
  const mockData = {
    timezone: 'Asia/Kolkata',
    country_name: 'India',
    region: 'Delhi',
    city: 'New Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData())['IP Address']).toBe('Unknown');
});

it('should fallback to Unknown if country_name is missing', async () => {
  const mockData = {
    timezone: 'Asia/Kolkata',
    ip: '123.123.123.123',
    region: 'Delhi',
    city: 'New Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData()).Country).toBe('Unknown');
});

it('should fallback to Unknown if region is missing', async () => {
  const mockData = {
    timezone: 'Asia/Kolkata',
    ip: '123.123.123.123',
    country_name: 'India',
    city: 'New Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData()).region).toBe('Unknown');
});

it('should fallback to Unknown if city is missing', async () => {
  const mockData = {
    timezone: 'Asia/Kolkata',
    ip: '123.123.123.123',
    country_name: 'India',
    region: 'Delhi',
    org: 'Test ISP',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData()).City).toBe('Unknown');
});

it('should fallback to Unknown if org is missing', async () => {
  const mockData = {
    timezone: 'Asia/Kolkata',
    ip: '123.123.123.123',
    country_name: 'India',
    region: 'Delhi',
    city: 'New Delhi',
  };

  (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => mockData });
  await setIpData();
  expect(JSON.parse(getIpData()).isp).toBe('Unknown');
});

it('should call sessionStorage.setItem with all processed IP data fields', async () => {
    const mockData = {
      timezone: 'Asia/Kolkata',
      ip: '123.123.123.123',
      country_name: 'India',
      region: 'Delhi',
      city: 'New Delhi',
      org: 'Test ISP',
    };
  
    const expected = {
      timezone: 'Asia/Kolkata',
      'IP Address': '123.123.123.123',
      Country: 'India',
      region: 'Delhi',
      City: 'New Delhi',
      isp: 'Test ISP',
    };
  
    const setItemSpy = jest.spyOn(window.sessionStorage, 'setItem');
  
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockData,
    });
  
    await setIpData();
  
    expect(setItemSpy).toHaveBeenCalledWith('ipData', JSON.stringify(expected));
  
    setItemSpy.mockRestore();
  
  });

  it('should handle null data from API gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => null,
    });
  
    await setIpData();
    const stored = JSON.parse(getIpData());
  
    expect(stored).toEqual({
      timezone: 'Unknown',
      'IP Address': 'Unknown',
      Country: 'Unknown',
      region: 'Unknown',
      City: 'Unknown',
      isp: 'Unknown',
    });
  });
  
});

