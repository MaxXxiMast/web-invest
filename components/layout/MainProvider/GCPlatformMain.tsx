import { type PropsWithChildren, useEffect } from 'react';
import { trackUser } from '../../../utils/gtm';
import { generateTempUserID } from './utils';

export default function GCPlatformMain({ children }: PropsWithChildren<{}>) {
  useEffect(() => {
    // REACT NATIVE MAY TAKE SOME TIME TO LOAD WINDOW OBJECT
    // SO, WE NEED TO CHECK IF WINDOW OBJECT IS AVAILABLE OR NOT
    trackUser(generateTempUserID());
  }, []);

  return <>{children}</>;
}
