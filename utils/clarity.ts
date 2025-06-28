import { newRelicErrorLog } from './gtm';

export function identifyClarityUser(userID: string | number) {
  try {
    const clarity = window?.['clarity'];
    if (clarity) {
      clarity('identify', String(userID));
    }
  } catch (err) {
    newRelicErrorLog(JSON.stringify(err));
  }
}
