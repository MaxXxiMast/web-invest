import { useEffect } from 'react';

// components
import Image from '../../../primitives/Image';

// utils
import { getCartPosition } from '../utils';

// styles
import styles from './Cart.module.css';

type Props = {
  id: number;
  img: string;
  comment: string;
  index: number;
  position: number;
  addCart: (id: number) => void;
};

const Cart = ({ id, img, comment, index, position, addCart }: Props) => {
  useEffect(() => {
    if (index + position === 0) {
      addCart(id);
    }
  }, [position]);
  return (
    <div
      style={{
        bottom: getCartPosition(index + position).bottom,
        zIndex: getCartPosition(index + position).zIndex,
        transform: getCartPosition(index + position).transform,
        opacity: getCartPosition(index + position).containerOpacity,
      }}
      className={`${styles.container} flex items-center gap-10`}
    >
      <Image
        src={img}
        height={60}
        width={60}
        layout="intrinsic"
        style={{ opacity: getCartPosition(index + position).opacity }}
      />
      <span
        className={styles.comment}
        dangerouslySetInnerHTML={{ __html: comment }}
        style={{ opacity: getCartPosition(index + position).opacity }}
      />
    </div>
  );
};

export default Cart;
