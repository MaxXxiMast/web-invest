import * as dateUtils from './date';
import * as stringUtils from './string';
import dayjs from 'dayjs';

jest.mock('dayjs');
const mockedDayjs = dayjs as jest.MockedFunction<typeof dayjs>;

jest.mock('./string', () => ({
    abbreviate: jest.fn(),
}));

describe('Date Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('converToDateFormat', () => {
        test('formats valid date string correctly', () => {
            const input = '2024-05-01T00:00:00Z'; // May 1, 2024
            const result = dateUtils.converToDateFormat(input);
            expect(result).toBe('May 01, 2024');
        });
      
        test('formats Date object correctly', () => {
            const input = new Date('2023-12-25'); // December 25, 2023
            const result = dateUtils.converToDateFormat(input);
            expect(result).toBe('December 25, 2023');
        });
    });

    describe('getDiffernceInTwoDates', () => {
        test('returns correct difference for multiple days', () => {
            const result = dateUtils.getDiffernceInTwoDates('2024-04-25', '2024-05-01');
            expect(result).toBe(6);
        });
        
        test('returns 0 if both parameters are omitted (defaults to now)', () => {
            const result = dateUtils.getDiffernceInTwoDates();
            expect(result).toBe(0);
        });
    });
  
    describe('getFinancialYearList', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
  
        test('returns financial years from 2020 to 2022', () => {
            mockedDayjs.mockImplementation((input: any, format?: string) => {
                if (format === 'YYYY') {
                    return {
                        format: () => '2020',
                    } as any;
                }
              
                if (input === undefined) {
                    return {
                        format: () => '2022',
                    } as any;
                }
              
                const numericYear = parseInt(input);
                return {
                    add: (n: number, unit: string) => ({
                        format: () => (numericYear + n).toString(),
                    }),
                    format: () => numericYear.toString(),
                } as any;
            });
          
            const result = dateUtils.getFinancialYearList('2020');
          
            expect(result).toEqual([
                { value: '2020-2021', labelKey: 'FY 2020-2021' },
                { value: '2021-2022', labelKey: 'FY 2021-2022' },
                { value: '2022-2023', labelKey: 'FY 2022-2023' },
            ]);
        });
    });
  
    describe('isBetweenDates', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('returns true when date is within range', () => {
            const fakeDate = {
                isBetween: jest.fn().mockReturnValue(true),
            };
          
            mockedDayjs.mockReturnValue(fakeDate as any);
          
            const result = dateUtils.isBetweenDates(undefined, '2024-01-01', '2024-12-31');
            expect(fakeDate.isBetween).toHaveBeenCalledWith('2024-01-01', '2024-12-31', 'day', '[)');
            expect(result).toBe(true);
        });
    });

    describe('getDateTimeZone', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        test('returns full timezone string when isAbbreviated is false', () => {
            const fakeFormat = jest.fn().mockReturnValue('GMT+5:30');
            
            mockedDayjs.mockReturnValue({ format: fakeFormat } as any);
            
            const result = dateUtils.getDateTimeZone('2024-05-01' as any);
            
            expect(result).toBe('GMT+5:30');
            expect(fakeFormat).toHaveBeenCalledWith('zzz');
        });
    
        test('returns abbreviated timezone when isAbbreviated is true', () => {
            const fakeFormat = jest.fn().mockReturnValue('GMT+5:30');
            (stringUtils.abbreviate as jest.Mock).mockReturnValue('GMT');
            
            mockedDayjs.mockReturnValue({ format: fakeFormat } as any);
            
            const result = dateUtils.getDateTimeZone('2024-05-01' as any, true);
            
            expect(result).toBe('GMT');
            expect(stringUtils.abbreviate).toHaveBeenCalledWith('GMT+5:30');
        });
    });

    describe('getCurrentFinancialYear', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
      
        test('returns FY2024-2025 when current month is after March (e.g., May)', () => {
            const fakeDate = {
                format: jest.fn((format) => {
                    if (format === 'YYYY') return '2024';
                }),
                subtract: jest.fn(() => ({ format: () => '2023' })),
                add: jest.fn(() => ({ format: () => '2025' })),
                month: jest.fn(() => 4), // May (0-indexed)
            };
        
            mockedDayjs.mockReturnValue(fakeDate as any);
            
            const result = dateUtils.getCurrentFinancialYear();
            expect(result).toBe('FY2024-2025');
        });
      
        test('returns FY2023-2024 when current month is January (before April)', () => {
            const fakeDate = {
                format: jest.fn((format) => {
                    if (format === 'YYYY') return '2024';
                }),
                subtract: jest.fn(() => ({ format: () => '2023' })),
                add: jest.fn(() => ({ format: () => '2025' })),
                month: jest.fn(() => 1),
            };
          
            mockedDayjs.mockReturnValue(fakeDate as any);
          
            const result = dateUtils.getCurrentFinancialYear();
            expect(result).toBe('FY2023-2024');
        });
    });

    describe('getNextFinancialYears', () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        test('returns correct next financial years when month is after March (e.g., May)', () => {
            const fakeDate = {
                format: jest.fn((fmt) => {
                  if (fmt === 'YYYY') return '2024';
                }),
                add: jest
                    .fn()
                    .mockImplementationOnce(() => ({ format: () => '2025' }))
                    .mockImplementationOnce(() => ({ format: () => '2026' }))
                    .mockImplementationOnce(() => ({ format: () => '2027' })),
                month: jest.fn(() => 4),
            };
          
            mockedDayjs.mockReturnValue(fakeDate as any);
          
            const result = dateUtils.getNextFinancialYears();
            expect(result).toEqual(['FY2025-2026', 'FY2026-2027']);
        });
      
        test('returns correct next financial years when month is before or equal to March (e.g., February)', () => {
            const fakeDate = {
                format: jest.fn((fmt) => {
                  if (fmt === 'YYYY') return '2024';
                }),
                add: jest
                    .fn()
                    .mockImplementationOnce(() => ({ format: () => '2025' }))
                    .mockImplementationOnce(() => ({ format: () => '2026' }))
                    .mockImplementationOnce(() => ({ format: () => '2027' })),
                month: jest.fn(() => 1),
            };
          
            mockedDayjs.mockReturnValue(fakeDate as any);
          
            const result = dateUtils.getNextFinancialYears();
            expect(result).toEqual(['FY2024-2025', 'FY2025-2026']);
        });
    });

    describe('getFinancialYearListForFilter', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
      
        test('returns correct financial years when current month is after March (e.g., May)', () => {
            const today = new Date('2024-05-01');
            const mockToday = {
                month: jest.fn().mockReturnValue(4),
                format: jest.fn().mockReturnValue('2024'),
            };
          
            mockedDayjs.mockImplementation((arg1: any, arg2?: any) => {
                if (!arg1) return mockToday as any;
                if (arg2 === 'YYYY') return { format: () => arg1 };
                if (typeof arg1 === 'string') {
                    return {
                        format: () => arg1,
                        add: (val: number, unit: string) => ({
                            format: () => (parseInt(arg1) + 1).toString(),
                        }),
                    } as any;
                }
                return mockToday as any;
            });
          
            const result = dateUtils.getFinancialYearListForFilter('2020');
            expect(result).toEqual([
                'FY2020-2021',
                'FY2021-2022',
                'FY2022-2023',
                'FY2023-2024',
                'FY2024-2025',
            ]);
        });
    });

    describe('getFinancialYearListOnCount', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
    
        test('returns 5 financial years starting from given year', () => {
            mockedDayjs.mockImplementation((arg1: any, arg2?: any) => {
                if (arg2 === 'YYYY') {
                    return { format: () => arg1.toString() };
                }
              
                return {
                    format: () => arg1.toString(),
                    add: (val: number, unit: string) => ({
                        format: () => (parseInt(arg1) + 1).toString(),
                    }),
                } as any;
            });
          
            const result = dateUtils.getFinancialYearListOnCount('2020', 5);
          
            expect(result).toEqual([
                { value: '2020-2021', labelKey: 'FY 2020-2021' },
                { value: '2021-2022', labelKey: 'FY 2021-2022' },
                { value: '2022-2023', labelKey: 'FY 2022-2023' },
                { value: '2023-2024', labelKey: 'FY 2023-2024' },
                { value: '2024-2025', labelKey: 'FY 2024-2025' },
            ]);
        });
    });

    describe('getCurrentFinancialYearFormat', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('getCurrentFinancialYearFormat returns formatted range', () => {
            const fakeDate = {
                format: jest.fn().mockReturnValue('2024'),
                subtract: jest.fn(() => ({ format: () => '2023' })),
                add: jest.fn(() => ({ format: () => '2025' })),
                month: jest.fn(() => 2),
            };
        
            mockedDayjs.mockReturnValue(fakeDate as any);
        
            const result = dateUtils.getCurrentFinancialYearFormat();
            expect(result).toBe('2023-2024');
        });

        test('getCurrentFinancialYearFormat returns formatted range', () => {
            const fakeDate = {
              format: jest.fn().mockReturnValue('2024'),
              subtract: jest.fn(() => ({ format: () => '2023' })),
              add: jest.fn(() => ({ format: () => '2025' })),
              month: jest.fn(() => 4),
            };
        
            mockedDayjs.mockReturnValue(fakeDate as any);
        
            const result = dateUtils.getCurrentFinancialYearFormat();
            expect(result).toBe('2024-2025');
        });
    })

    describe('decodeURLEncodedString', () => {
        test('decodes and formats a valid URL-encoded date string', () => {
            const input = 'Mon%20May%2020%202024%2015:22:30%20GMT+0000%20(Coordinated%20Universal%20Time)';
            const result = dateUtils.decodeURLEncodedString(input);
            expect(result).toBe('2024-05-20 15:22:30');
        });
    });
});
