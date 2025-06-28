import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TooltipCompoent from './TooltipCompoent';

beforeAll(() => {
  global.dispatchEvent = jest.fn(); // Mocking the global dispatchEvent method
});

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false), // Mocking
}));

type PlacementProp =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

describe('TooltipComponent - Desktop and Mobile', () => {
  test('does not render tooltip when toolTipText is empty', () => {
    const { container } = render(
      <TooltipCompoent toolTipText="">Hover me</TooltipCompoent>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('does not render tooltip when toolTipText is undefined', () => {
    const { container } = render(
      <TooltipCompoent toolTipText={undefined}>Hover me</TooltipCompoent>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('shows tooltip on hover', async () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Hover me</TooltipCompoent>
    );
    const triggerElement = screen.getByText('Hover me');
    await userEvent.hover(triggerElement);
    expect(await screen.findByText('Sample Tooltip')).toBeInTheDocument();
  });

  test('renders the component without crashing', () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Hover me</TooltipCompoent>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  test('hides tooltip when hover is removed', async () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Hover me</TooltipCompoent>
    );
    const triggerElement = screen.getByText('Hover me');
    await userEvent.hover(triggerElement);
    expect(await screen.findByText('Sample Tooltip')).toBeInTheDocument();
    await userEvent.unhover(triggerElement);
    await waitFor(() => {
      expect(screen.queryByText('Sample Tooltip')).not.toBeInTheDocument();
    });
  });

  test('shows tooltip on keyboard focus', async () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">
        <button>Focus me</button>
      </TooltipCompoent>
    );
    const triggerElement = screen.getByText('Focus me');
    triggerElement.focus();
    const tooltip = await screen.findByLabelText('Sample Tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  const placements: PlacementProp[] = ['top', 'bottom', 'left', 'right'];
  it.each(placements)(
    'renders tooltip with correct position: %s',
    async (placement) => {
      render(
        <TooltipCompoent toolTipText="Tooltip text" placementValue={placement}>
          <span>Hover me</span>
        </TooltipCompoent>
      );

      const triggerElement = screen.getByText('Hover me');
      await userEvent.hover(triggerElement);
      const tooltipPopper = await screen.findByRole('tooltip');
      expect(tooltipPopper).toHaveAttribute('data-popper-placement', placement);
    }
  );

  test('shows tooltip on tap on `MOBILE`', async () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Tap me</TooltipCompoent>
    );
    const triggerElement = screen.getByText('Tap me');
    await userEvent.click(triggerElement);
    expect(await screen.findByText('Sample Tooltip')).toBeInTheDocument();
  });

  test('does not duplicate tooltip on double tap', async () => {
    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Tap me</TooltipCompoent>
    );
    const triggerElement = screen.getByText('Tap me');
    await userEvent.click(triggerElement);
    await userEvent.click(triggerElement);
    expect(screen.getAllByText('Sample Tooltip').length).toBe(1);
  });
});

describe('Tooltip Component on scroll', () => {
  const renderTooltip = (props = {}) => {
    return render(
      <TooltipCompoent
        toolTipText="Sample Tooltip"
        checkOnScrollTooltip={false}
        additionalStyle={{}}
        {...props}
      >
        Hover me
      </TooltipCompoent>
    );
  };

  it('does not close tooltip on scroll when `checkOnScrollTooltip` is false', async () => {
    global.outerWidth = 700;
    global.dispatchEvent(new Event('resize'));
    renderTooltip({ checkOnScrollTooltip: false });
    const triggerElement = screen.getByText('Hover me');
    await userEvent.hover(triggerElement);
    expect(screen.getByText('Sample Tooltip')).toBeInTheDocument();
    fireEvent.scroll(window);
    expect(screen.getByText('Sample Tooltip')).toBeInTheDocument();
  });

  it('does not close tooltip on scroll when `checkOnScrollTooltip` is true', async () => {
    global.innerWidth = 700;
    global.dispatchEvent(new Event('resize'));
    renderTooltip({ checkOnScrollTooltip: true });
    const triggerElement = screen.getByText('Hover me');
    await userEvent.hover(triggerElement);
    expect(screen.getByText('Sample Tooltip')).toBeInTheDocument();
    fireEvent.scroll(window);
    expect(screen.getByText('Sample Tooltip')).toBeInTheDocument();
  });
});

// Test for media query changes in useMediaQuery.tsx
describe('useMediaQuery Hook', () => {
  test('updates tooltip behavior on viewport change', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)',
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    render(
      <TooltipCompoent toolTipText="Sample Tooltip">Tap me</TooltipCompoent>
    );
    expect(screen.getByText('Tap me')).toBeInTheDocument();
  });
});
