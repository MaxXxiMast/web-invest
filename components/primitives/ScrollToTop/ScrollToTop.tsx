import React from 'react';
import styles from './ScrollToTop.module.css';

const ScrollToTop = () => {
  const [showTopScroll, setShowTopScroll] = React.useState(false);
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowTopScroll(true);
      } else {
        setShowTopScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <>
      <div
        className={`${styles.ScrollToTop} ${
          showTopScroll ? styles.ShowBtn : ''
        }`}
        onClick={() => handleScrollTop()}
      >
        <div className={styles.ScrollToTopInner}>
          <span className="icon-caret-up" />
          <span>Top</span>
        </div>
      </div>
    </>
  );
};

export default ScrollToTop;
