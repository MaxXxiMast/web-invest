import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import SortBy from './SortBy';

describe('SortBy Component', () => {

  let originalOuterWidth: number;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    originalOuterWidth = global.outerWidth;
  });
  
  afterEach(() => {
    global.outerWidth = originalOuterWidth;
    jest.clearAllMocks();
  });

  const mockHandleFilterItem = jest.fn();
  const mockRenderer = jest.fn().mockReturnValue(<li>Custom Option</li>);
  const mockChildren = <div data-testid="child">Test Child</div>;
  const mockData = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const mockKeyMappingObject = { 'Sort By': 'Sort By', 'Option 1': 'First', 'Option 2': 'Second', 'Option 3': 'Third' };

  // Test case - 1
  test('should render default values', () => {
    render(
      <SortBy 
        data={mockData}
        handleFilterItem={mockHandleFilterItem} 
      />
    );

    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  // Test case - 2
  test('should render provided filter name and selected value', () => {
    render(
      <SortBy 
        data={mockData} 
        selectedValue={-5}
        handleFilterItem={mockHandleFilterItem}
        keyMappingObject={null} 
        filterName="Custom Sort" 
      />
    );

    expect(screen.getByText('Custom Sort')).toBeInTheDocument();
  });

  // Test case - 3
  test('should render children inside the SortBy component', () => {
    render(
      <SortBy>
        {mockChildren}
      </SortBy>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  })

  // Test case - 4
  test('toggles dropdown when clicked', async () => {
    render(
      <SortBy 
        data={mockData} 
        handleFilterItem={mockHandleFilterItem} 
      />
    );

    const dropdownTrigger = screen.getByText('Sort By');
    
    expect(screen.getByRole('list').closest('.ShortByDropDown')).toHaveClass('hidden');
    
    fireEvent.click(dropdownTrigger);
    await waitFor(() => expect(screen.getByRole('list').closest('.ShortByDropDown')).toHaveClass('visible'));
    
    fireEvent.click(document.body);
    await waitFor(() => expect(screen.getByRole('list').closest('.ShortByDropDown')).toHaveClass('hidden'));

    fireEvent.click(screen.getByText('Sort By'));
    fireEvent.click(screen.getByText('Option 1'));
    expect(mockHandleFilterItem).toHaveBeenCalledWith('Option 1');
  });

  // Test case - 5
  test('renders mapped key labels correctly', () => {
    render(
      <SortBy 
        data={mockData}
        keyMappingObject={mockKeyMappingObject} 
        handleFilterItem={mockHandleFilterItem} 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  // Test case - 6
  test('should render the custom class name', () => {
    render(
      <SortBy 
        className="custom-class" 
      />
    );
    
    const sortByElement = screen.getByText('Sort By').closest('.ShortBy');
    expect(sortByElement).toHaveClass('custom-class');
  });

  // Test case - 7
  test('should not throw error when handleFilterItem is not provided', () => {
    render(
      <SortBy 
        data={mockData} 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    fireEvent.click(screen.getByText('Option 1'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  // Test case - 8
  test('renders SortBy with a non-default selectedValue', async () => {
    render(
      <SortBy 
        data={mockData} 
        selectedValue={2} 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    expect(screen.getByText('Option 3').closest('.Active')).toHaveClass('Active');
  });

  // Test case - 9
  test('renders customDataRenderer output when provided', () => {
    render(
      <SortBy 
        customDataRenderer={mockRenderer} 
      />
    );
    
    expect(screen.getByText('Custom Option')).toBeInTheDocument();
  });

  // Test case - 10
  test('should render window when isMobileDrawer prop is false', () => {
    global.outerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <SortBy 
        data={mockData} 
        isMobileDrawer={false} 
        handleFilterItem={mockHandleFilterItem} 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  // Test case - 11
  test('renders mobile drawer with custom title and customDataRenderer', () => {
    global.outerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <SortBy 
        data={mockData} 
        isMobileDrawer={true} 
        customDataRenderer={mockRenderer} 
        mobileDrawerTitle="Custom Title" 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(mockRenderer).toHaveBeenCalled();
    expect(screen.getByText("Custom Option")).toBeInTheDocument();
  });

  // Test case - 12
  test('should close mobile drawer on selection', () => {
    global.outerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(
      <SortBy 
        data={mockData} 
        isMobileDrawer={true} 
        handleFilterItem={mockHandleFilterItem}
        keyMappingObject={null}
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    fireEvent.click(screen.getByText('Option 1'));
    expect(mockHandleFilterItem).toHaveBeenCalledWith('Option 1');
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  // Test case - 13
  test('should close mobile drawer on clicking close button and also render mapped key labels correctly in mobile', () => {
    global.outerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <SortBy 
        data={mockData} 
        isMobileDrawer={true}
        keyMappingObject={mockKeyMappingObject}
        handleFilterItem={mockHandleFilterItem} 
      />
    );
    
    fireEvent.click(screen.getByText('Sort By'));
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();

    const closeButton = screen.getByRole('presentation').querySelector('.CloseBtn span');
    fireEvent.click(closeButton);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });
});
