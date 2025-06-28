import { render, fireEvent } from '@testing-library/react';
import NavCaret from './NavCaret';
import { NavigationLinkModel } from './NavigationModels';
import * as useMediaQueryHook from '../../../utils/customHooks/useMediaQuery';

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn()
}));

describe('NavCaret Component', () => {
  const mockUseMediaQuery = jest.spyOn(useMediaQueryHook, 'useMediaQuery');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders NavCaret with children on mobile device', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    const mockLinks: NavigationLinkModel[] = [
        {     
            id: 1, 
            accessibilityLabel: 'Link',
            clickUrl: '/link',
            openInNewTab: false,
            title: 'Link' 
        }
    ];
    
    render(<NavCaret linkArr={mockLinks} />);
    
    const caretElement = document.querySelector('.icon-caret-down');
    expect(caretElement).toBeInTheDocument();
  });

  test('renders NavCaret without children on mobile device', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<NavCaret linkArr={[]} />);
    
    const caretElement = document.querySelector('.icon-caret-down');
    expect(caretElement).toBeInTheDocument();
    
    const navCaretElement = document.querySelector('span').classList.contains('NavCaretRight');
    expect(navCaretElement).toBeTruthy();
  });

  test('does not render NavCaret on desktop without children', () => {
    mockUseMediaQuery.mockReturnValue(false);
    
    const { container } = render(<NavCaret linkArr={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('renders NavCaret on desktop with children', () => {
    mockUseMediaQuery.mockReturnValue(false);
    
    const mockLinks: NavigationLinkModel[] = [
        {     
            id: 1, 
            accessibilityLabel: 'Link',
            clickUrl: '/link',
            openInNewTab: false,
            title: 'Link' 
        }
    ];
    
    render(<NavCaret linkArr={mockLinks} />);
    
    const caretElement = document.querySelector('.icon-caret-down');
    expect(caretElement).toBeInTheDocument();
  });
});