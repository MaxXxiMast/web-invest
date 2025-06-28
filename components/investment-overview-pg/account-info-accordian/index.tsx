import { useContext, useState } from 'react';

// Components
import Image from '../../primitives/Image';
import ProfileImage from '../../primitives/Navigation/ProfileImage';

// Utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';

// Contexts
import { InvestmentOverviewPGContext } from '../../../contexts/investmentOverviewPg';

// Styles
import classes from './AccountInfoAccordian.module.css';

type Props = {
  userName?: string;
  bankAccNumber?: string;
  bankName?: string;
  className?: string;
  dematNo?: string;
  panNo?: string;
};

/**
 * Account info component
 * @param userName User name
 * @param bankAccNumber User bank account number
 * @param bankName User bank name
 * @param showCardTitle Title visibility
 * @param className Extra class name
 * @returns
 */

const AccountInfoAccordian = ({
  userName = '',
  bankAccNumber = '',
  bankName = '',
  className,
  dematNo = '',
  panNo = '',
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { asset, isMarketOpen }: any = useContext(InvestmentOverviewPGContext);

  const handleOnClick = () => {
    setIsOpen(!isOpen);

    trackEvent('Account Info Clicked', {
      name: userName,
      amo: !isMarketOpen && asset?.isRfq,
      action: !isOpen ? 'expanded' : 'collapsed',
    });
  };

  const renderEle = () => {
    return (
      <div className={classes.Header}>
        <div className={`flex ${classes.Left}`}>
          <ProfileImage size={16} />
          <span className={classes.accountInfoTitle}>{'Account Info'}</span>
        </div>
        <div className={classes.Right} onClick={handleOnClick}>
          {userName &&
          typeof userName !== 'undefined' &&
          userName !== 'undefined' ? (
            <div className={classes.Widget}>
              <span>
                {userName && userName.length > 20
                  ? userName?.slice(0, 7) + '...' + userName?.slice(-7)
                  : userName}
              </span>
            </div>
          ) : null}

          <span className={`${classes.Caret} ${isOpen ? classes.UpCaret : ''}`}>
            <span
              className="icon-caret-down"
              style={{
                fontSize: '10px',
                color: 'var(--gripTextMain, #373a46)',
              }}
            />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`${classes.Wrapper} ${handleExtraProps(className)}`}>
      {renderEle()}

      {isOpen ? (
        <>
          <div className={classes.WidgetGrp}>
            {panNo ? (
              <div className={`${classes.Widget} dematAccNumber `}>
                <span
                  className="icon-pan"
                  style={{
                    fontSize: '18px',
                    color: 'var(--gripTextMain, #373a46)',
                  }}
                />
                <span>PAN{panNo}</span>
              </div>
            ) : null}
          </div>

          <div className={classes.WidgetGrp}>
            {dematNo ? (
              <div className={`${classes.Widget} dematAccNumber `}>
                <span
                  className="icon-bag"
                  style={{
                    fontSize: '18px',
                    color: 'var(--gripTextMain, #373a46)',
                  }}
                />
                <span>DEMAT{dematNo}</span>
              </div>
            ) : null}
          </div>

          {bankAccNumber || bankName ? (
            <div className={classes.WidgetGrp}>
              {bankAccNumber ? (
                <div className={`${classes.Widget} bankAccNumber`}>
                  <Image
                    src={`${GRIP_INVEST_BUCKET_URL}icons/bank.svg`}
                    alt="Bank Icon"
                    width={18}
                    height={18}
                    className="bankAccNumberImage"
                    layout="fixed"
                  />
                  <span>
                    {bankName && bankName.length > 28
                      ? bankName?.slice(0, 14) + '...' + bankName?.slice(-14)
                      : bankName}{' '}
                    {[...Array(bankAccNumber.length - 3)].map(() => '*')}
                    {bankAccNumber?.slice(-3)}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default AccountInfoAccordian;
