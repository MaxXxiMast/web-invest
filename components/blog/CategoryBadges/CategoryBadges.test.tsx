import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryBadges from './index';

jest.mock('../../../utils/string', () => ({
  handleExtraProps: (cls: string) => cls,
}));

describe('CategoryBadges', () => {
  it('should render nothing when tagList is empty', () => {
    const { container } = render(<CategoryBadges tagList={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render tags passed in tagList', () => {
    const tags = ['Finance', 'Tech', 'AI'];
    render(<CategoryBadges tagList={tags} />);

    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
      expect(screen.getByText(tag)).toHaveAttribute('title', tag);
    });
  });

  it('should apply className and ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <CategoryBadges tagList={['Test']} className="custom-class" ref={ref} />
    );
    const wrapper = ref.current;
    expect(wrapper).toBeInstanceOf(HTMLDivElement);
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should call handleClickEvent when a badge is clicked', () => {
    const mockClick = jest.fn();
    const tags = ['Crypto', 'Bonds'];
    render(<CategoryBadges tagList={tags} handleClickEvent={mockClick} />);

    fireEvent.click(screen.getByText('Crypto'));
    expect(mockClick).toHaveBeenCalledWith('Crypto');

    fireEvent.click(screen.getByText('Bonds'));
    expect(mockClick).toHaveBeenCalledWith('Bonds');
    expect(mockClick).toHaveBeenCalledTimes(2);
  });
});
