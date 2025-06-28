import React, { useEffect } from 'react';

// components
import Cart from './Cart';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';

// styles
import styles from './FerrisWheel.module.css';

const data = [
  {
    id: 1,
    img: `${GRIP_INVEST_BUCKET_URL}marketplace/Ankit.png`,
    comment:
      'Ankit purchased <b>35 units</b> of Navi bond with just <b>1 month remaining tenure</b>',
  },
  {
    id: 2,
    img: `${GRIP_INVEST_BUCKET_URL}marketplace/Mahima.png`,
    comment: 'Mahima got a Ugro bond at <b>10% better YTM</b> than elsewhere',
  },
  {
    id: 0,
    img: `${GRIP_INVEST_BUCKET_URL}marketplace/Rohit.png`,
    comment:
      'Rohit bought a <b>13.25% returns</b> bond with <b>3 month remaining tenure</b>',
  },
];

const FerrisWheel = () => {
  const [carts, setCarts] = React.useState([...data, data[0]]);
  const [position, setPosition] = React.useState(1);

  const addCart = (id: number) => {
    setCarts((prev) => {
      const newCarts = [...prev];
      newCarts.push(data[id]);
      if (newCarts.length === 20) {
        setPosition(1);
        return newCarts.slice(-(data.length + 1));
      }
      return newCarts;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        return prev - 1;
      });
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderCarts = () => {
    return carts.map((item, index) => (
      <Cart
        id={item.id}
        key={`cart-${index}`}
        img={item.img}
        comment={item.comment}
        index={index}
        position={position}
        addCart={addCart}
      />
    ));
  };

  return (
    <div className={`flex justify-center ${styles.container}`}>
      {renderCarts()}
    </div>
  );
};

export default FerrisWheel;
