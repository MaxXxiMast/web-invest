import { render, screen, fireEvent } from '@testing-library/react';
import RadioGroupCustom from './index';

type DocSubTypeModel = 'PASSPORT' | 'AADHAAR' | 'PAN';

interface DocOptionsModel {
  label: string;
  value: DocSubTypeModel;
}

// Mock props
const mockOptions: DocOptionsModel[] = [
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Aadhaar', value: 'AADHAAR' },
  { label: 'PAN Card', value: 'PAN' },
];

describe('RadioGroupCustom Component', () => {
  const handleChangeEvent = jest.fn();

  const defaultProps = {
    options: mockOptions,
    value: 'PASSPORT' as DocSubTypeModel,
    handleChangeEvent,
    row: true,
    name: 'kyc-docs',
    id: 'kyc-docs-radio',
    classes: {},
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all radio options', () => {
    render(<RadioGroupCustom {...defaultProps} />);

    expect(screen.getByLabelText('Passport')).toBeInTheDocument();
    expect(screen.getByLabelText('Aadhaar')).toBeInTheDocument();
    expect(screen.getByLabelText('PAN Card')).toBeInTheDocument();
  });

  it('should have the correct radio selected by default', () => {
    render(<RadioGroupCustom {...defaultProps} />);
    const selectedRadio = screen.getByLabelText('Passport') as HTMLInputElement;
    expect(selectedRadio.checked).toBe(true);
  });

  it('should trigger handleChangeEvent when a different radio is clicked', () => {
    render(<RadioGroupCustom {...defaultProps} />);
    const newRadio = screen.getByLabelText('Aadhaar') as HTMLInputElement;

    fireEvent.click(newRadio);
    expect(handleChangeEvent).toHaveBeenCalledTimes(1);
    expect(handleChangeEvent.mock.calls[0][0].target.value).toBe('AADHAAR');
  });

  it('should not render anything if options array is empty', () => {
    const props = { ...defaultProps, options: [] };
    const { container } = render(<RadioGroupCustom {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom root class if provided in props.classes', () => {
    const propsWithClass = {
      ...defaultProps,
      classes: { root: 'custom-class' },
    };
    const { container } = render(<RadioGroupCustom {...propsWithClass} />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
