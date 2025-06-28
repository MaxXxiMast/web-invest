import Button, { ButtonType } from '../../Button';
import classes from './ReferEarn.module.css';

type Props = {
  renderRewardsText?: string;
  handleBtnClickEvent?: () => void;
};
const ReferEarnBtn = ({
  renderRewardsText,
  handleBtnClickEvent = () => {},
}: Props) => {
  return (
    <div className={classes.ReferBtn}>
      <Button
        variant={ButtonType.Secondary}
        compact
        width={'150px'}
        onClick={handleBtnClickEvent}
      >
        <>
          <span className={`icon-refer ${classes.ReferIcon}`} />
          Refer Now
        </>
      </Button>
      {renderRewardsText ? (
        <div className={classes.ReferralAmount}>{renderRewardsText}</div>
      ) : null}
    </div>
  );
};

export default ReferEarnBtn;
