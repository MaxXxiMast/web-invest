import { useEffect, useState } from 'react';

export function useMediaQuery(query = '(max-width: 767px)'): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const matchMedia = window.matchMedia(query);

      // Triggered at the first client-side load and if query changes
      handleChange();

      // Listen matchMedia
      if (matchMedia.addListener) {
        matchMedia.addListener(handleChange);
      } else {
        matchMedia.addEventListener('change', handleChange);
      }

      return () => {
        if (matchMedia.removeListener) {
          matchMedia.removeListener(handleChange);
        } else {
          matchMedia.removeEventListener('change', handleChange);
        }
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}
