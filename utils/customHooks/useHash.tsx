import React from 'react';

const useHash = () => {
  const [hash, setHash] = React.useState(() => window.location.hash);

  const hashChangeHandler = React.useCallback(() => {
    setHash(window.location.hash);
  }, []);

  React.useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler);

    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, [hashChangeHandler]);

  const updateHash = React.useCallback((newHash: string) => {
    if (!newHash.startsWith('#')) {
      newHash = '#' + newHash;
    }
    if (newHash !== window.location.hash) {
      location.replace(newHash);
    }
  }, []);

  return { hash, updateHash };
};

export default useHash;
