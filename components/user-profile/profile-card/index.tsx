// NODE MODULES
import { memo } from 'react';

// UTILS
import { handleExtraProps } from '../../../utils/string';
import { useAppSelector } from '../../../redux/slices/hooks';

// CUSTOM COMPONENTS
import Button, { ButtonType } from '../../primitives/Button';
import ProfileImage from '../../primitives/Navigation/ProfileImage';
import InvestmentStyle from '../InvestmentStyle';

// STYLES
import classes from './ProfileCard.module.css';

type ProfileCardProps = {
  onBookClick?: () => void;
  className?: string;
};

const ProfileCardRfq = memo(
  ({ onBookClick, className = '' }: ProfileCardProps) => {
    const { userData } = useAppSelector((state) => state.user);

    // Check for the presence of userData before rendering
    if (!userData) {
      return null;
    }

    return (
      <div className={`flex ${classes.Wrapper} ${handleExtraProps(className)}`}>
        <div className={`flex items-center ${classes.Left}`}>
          <ProfileImage size={62} />
          <div className={`flex-column ${classes.details}`}>
            <span className={classes.profileCardTitle}>
              {userData.firstName} {userData.lastName}
            </span>
            <InvestmentStyle />
          </div>
        </div>
        <div className={classes.Right}>
          <Button
            onClick={onBookClick}
            variant={ButtonType.PrimaryLight}
            width={'auto'}
            className={classes.BookCall}
          >
            Book a call
          </Button>
        </div>
      </div>
    );
  }
);

ProfileCardRfq.displayName = 'ProfileCardRfq';

export default ProfileCardRfq;
