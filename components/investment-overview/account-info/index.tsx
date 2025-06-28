import { ReactNode } from 'react';
import {
  GRIP_INVEST_BUCKET_URL,
  handleExtraProps,
} from '../../../utils/string';
import Image from '../../primitives/Image';
import classes from './AccountInfo.module.css';

type Props = Partial<{
  id: string;
  userName: string;
  bankAccNumber: string;
  bankName: string;
  className: string;
  showCardTitle: boolean;
  children: ReactNode;
  dematNo: string;
  bankOptional: Partial<{
    bankTitle?: string;
    isShowBankIcon?: boolean;
  }>;
}>;

/**
 * Account info component
 * @param userName User name
 * @param bankAccNumber User bank account number
 * @param bankName User bank name
 * @param showCardTitle Title visibility
 * @param className Extra class name
 * @returns
 */

const AccountInfo = ({
  id = '',
  userName = '',
  bankAccNumber = '',
  bankName = '',
  className,
  showCardTitle = true,
  children = null,
  dematNo = '',
  bankOptional: { isShowBankIcon = true, bankTitle = 'Pay from' } = {},
}: Props) => {
  return (
    <div
      className={`${classes.Wrapper} ${handleExtraProps(className)}`}
      id={id}
    >
      <div>
        {showCardTitle ? <h3 className={classes.Title}>Account Info</h3> : null}
        {userName ? (
          <div className={classes.WidgetGrp}>
            <div className={classes.Widget}>
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}icons/user.svg`}
                alt="User Icon"
                layout="fixed"
                width={14}
                height={14}
              />
              <span>
                {userName && userName.length > 14
                  ? userName?.slice(0, 7) + '...' + userName?.slice(-7)
                  : userName}
              </span>
            </div>
            {dematNo ? (
              <div className={`${classes.Widget} dematAccNumber `}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}icons/bag.svg`}
                  alt="Bag Icon"
                  layout="fixed"
                  width={14}
                  height={14}
                />
                <span>DEMAT a/c {dematNo}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {bankAccNumber || bankName ? (
          <>
            {showCardTitle ? null : (
              <span id="accountInfoBankTitle" className={classes.payFrom}>
                {bankTitle}
              </span>
            )}
            <div className={classes.WidgetGrp}>
              {bankAccNumber ? (
                <div className={`${classes.Widget} bankAccNumber`}>
                  {isShowBankIcon ? (
                    <Image
                      src={`${GRIP_INVEST_BUCKET_URL}icons/bank.svg`}
                      alt="Bank Icon"
                      layout="fixed"
                      width={14}
                      height={14}
                      className="bankAccNumberImage"
                    />
                  ) : null}

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
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default AccountInfo;
