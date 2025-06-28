import { render, screen, fireEvent } from '@testing-library/react';
import Image from './index';
import NextImage from 'next/legacy/image';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// Mock External Dependencies
jest.mock('next/legacy/image', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onClick, onError, alt, style }) => (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          alt={alt} 
          style={style} 
          onClick={onClick} 
          onError={onError} 
        />
      </>
    )),
  };
});

describe('Image Component', () => {

  // Test case 1
  it('should render with default props', () => {
    render(<Image src="test.jpg" alt='mock-alt'/>);
    const image = screen.getByAltText('mock-alt'); 
    expect(image).toBeInTheDocument();
  });

  // Test case 2
  it('should render with provided alt text', () => {
    render(<Image src="test.jpg" alt="Test Image" />);
    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
  });

  // Test case 3
  it('should render with default alt text when no alt is provided', () => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    render(<Image src="test.jpg" />);
    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
  });

  // Test case 4
  it('should call onClick handler when clicked', () => {
    const onClickMock = jest.fn();
    render(<Image src="test.jpg" onClick={onClickMock} alt='mock-alt'/>);
    
    const image = screen.getByAltText('mock-alt'); 
    fireEvent.click(image);
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  // Test case 5
  it('should use placeholder when src is empty or undefined', () => {
    render(<Image src={undefined} alt='mock-alt'/>);
    
    const image = screen.getByAltText('mock-alt'); 
    expect(image).toBeInTheDocument();
    expect(NextImage).toHaveBeenCalledWith(
      expect.objectContaining({
        src: `${GRIP_INVEST_BUCKET_URL}commons/placeHolder.png` 
      }),
      {}
    );
  });


  // Test case 6
  it('should trigger onError handler when an error occurs', () => {
    const onErrorMock = jest.fn();
    render(<Image src="invalid.jpg" onError={onErrorMock} alt='mock-alt'/>);
    
    const image = screen.getByAltText('mock-alt'); // Error handling test
    fireEvent.error(image);
    
    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });
});