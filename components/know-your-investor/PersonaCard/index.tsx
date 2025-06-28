// Types
import { type PropsWithChildren } from 'react';

// Utils
import { personaData } from './utils';
import { GRIP_INVEST_BUCKET_URL, urlify } from '../../../utils/string';

import { isUserLogged } from '../../../utils/user';

// Components
import Image from '../../primitives/Image';

// Hooks
import { useAppSelector } from '../../../redux/slices/hooks';

// Styles
import styles from './PersonaCard.module.css';

type PersonaCard = {
  personaStrapiData?: Record<string, any>;
};

export default function PersonaCard({
  children,
  personaStrapiData,
}: PropsWithChildren<PersonaCard>) {
  const personaName =
    useAppSelector((state) => state.knowYourInvestor.customerPersonality) || '';

  const { firstName, lastName } = useAppSelector(
    (state) => state.user.userData
  );
  const isLoggedInUser = isUserLogged();

  if (isLoggedInUser && !personaName) {
    return null;
  }

  // Data accoridng to persona
  const dataObj = isLoggedInUser
    ? personaStrapiData?.[personaName?.toLowerCase()] || {}
    : personaData?.['the strategist'] || {};
  return (
    <div
      className={`items-align-center-column-wise ${styles.profileSection}`}
      style={{
        ...dataObj?.styles,
        backgroundImage: `url(${GRIP_INVEST_BUCKET_URL}${dataObj?.styles?.backgroundImage})`,
      }}
      id="PROFILECARD"
    >
      <span
        className={`flex_wrapper ${styles.iconWrapper} ${dataObj?.icon}`}
        style={{ color: dataObj?.iconColor }}
      />
      <span className={`${styles.name} textEllipsis`}>{`${firstName || ''} ${
        lastName || ''
      }`}</span>
      <span className={styles.role}>{dataObj?.role}</span>
      <span className={styles.description}>{dataObj?.description}</span>
      <div className={`flex-column ${styles.traitsCard}`}>
        <span className={styles.traitsTitle}>{dataObj?.traitsTitle}</span>
        <ul className={`flex-column ${styles.traitsList}`}>
          {dataObj?.traits?.map((trait: string) => (
            <li
              key={`trait-${urlify(trait)}`}
              className={`flex ${styles.traitItem}`}
            >
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}icons/Unread.svg`}
                width={16}
                height={16}
                layout="fixed"
                alt="unread tick"
              />
              {trait.trim()}
            </li>
          ))}
        </ul>
      </div>
      {children}
    </div>
  );
}
