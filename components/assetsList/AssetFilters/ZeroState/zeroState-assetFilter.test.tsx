import { render, screen, fireEvent } from '@testing-library/react';
import ZeroState from './zeroState';

// Mocks
jest.mock('../../../primitives/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, className }: any) => (
    <button className={className} onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
  ButtonType: {
    Primary: 'Primary',
    PrimaryLight: 'PrimaryLight',
  },
}));

jest.mock('../../../primitives/Image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="zero-icon" />,
}));

jest.mock('../../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://static-assets.gripinvest.in/',
  handleExtraProps: (cls: string = '') => cls,
}));

jest.mock('../../../../utils/resolution', () => ({
  isMobile: false, // Default to desktop
}));

describe('ZeroState Component', () => {
  it('renders with default props', () => {
    render(<ZeroState />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('please try again later')).toBeInTheDocument();
    expect(screen.queryByTestId('zero-icon')).not.toBeInTheDocument();
  });

  it('renders icon when showIcon is true', () => {
    render(<ZeroState showIcon />);
    expect(screen.getByTestId('zero-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zero-icon')).toHaveAttribute(
      'src',
      expect.stringContaining('noData.svg')
    );
  });

  it('renders custom header and subHeader', () => {
    render(
      <ZeroState
        header="Test Header"
        subHeader="Test Subheader"
        customHeaderClassName="custom-header"
      />
    );
    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test Subheader')).toBeInTheDocument();
  });

  it('renders and clicks customButtonText1', () => {
    const action1 = jest.fn();
    render(
      <ZeroState customButtonText1="Button One" customButtonAction1={action1} />
    );
    const btn = screen.getByText('Button One');
    fireEvent.click(btn);
    expect(action1).toHaveBeenCalled();
  });

  it('renders and clicks customButtonText2', () => {
    const action2 = jest.fn();
    render(
      <ZeroState customButtonText2="Button Two" customButtonAction2={action2} />
    );
    const btn = screen.getByText('Button Two');
    fireEvent.click(btn);
    expect(action2).toHaveBeenCalled();
  });

  it('renders both buttons with provided class names', () => {
    render(
      <ZeroState
        customButtonText1="B1"
        customButtonText2="B2"
        buttonClassName1="btn-1"
        buttonClassName2="btn-2"
      />
    );
    expect(screen.getByText('B1')).toHaveClass('btn-1');
    expect(screen.getByText('B2')).toHaveClass('btn-2');
  });

  it('applies container and header classNames', () => {
    render(
      <ZeroState
        className="container-class"
        customHeaderClassName="header-class"
        header="Hello"
      />
    );
    expect(screen.getByTestId('zeroStateContainer')).toHaveClass(
      'container-class'
    );
    expect(screen.getByText('Hello')).toHaveClass('header-class');
  });
});
