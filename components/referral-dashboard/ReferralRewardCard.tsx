import React, { useState } from 'react';
import Button from '../primitives/Button';
import ArrowButton from '../primitives/ArrowButton';
import styles from '../../styles/Referral/ReferralRewardCard.module.css';
import { useRouter } from 'next/router';
import { numberToCurrency } from '../../utils/number';
import { handleRedeemNow } from '../../redux/slices/referral';
import { useAppDispatch } from '../../redux/slices/hooks';
import { checkForRedeemButton } from '../../utils/referral';
import MaterialModalPopup from '../primitives/MaterialModalPopup';
import { isMobile } from '../../utils/resolution';
import { callErrorToast } from '../../api/strapi';
import TooltipCompoent from '../primitives/TooltipCompoent/TooltipCompoent';
import Image from '../primitives/Image';
import {
  GRIP_INVEST_BUCKET_URL,
  GRIP_INVEST_GI_STRAPI_BUCKET_URL,
} from '../../utils/string';
type Props = {
  data?: any;
  className?: any;
};

const ReferralRewardCard = ({ data, className }: Props) => {
  const { totalEarnings = 0, redeemedEarnings = 0 } = data?.dashboardMetrics;
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    liveDealCreditAmount = 0,
    pendingDebitAmount = 0,
    completedDealCreditAmount = 0,
  } = data?.dashboardMetrics?.unredeemedCreditBreakup ?? {};
  const { disable, msg } = checkForRedeemButton(
    data?.userData,
    data?.dashboardMetrics,
    data?.isEsignPending
  );
  const router = useRouter();
  const redirectToHistory = () => {
    router.push('/reward-history');
  };

  const redeemRewards = () => {
    if (disable) {
      callErrorToast(msg);
    } else {
      setLoading(true);
      dispatch(handleRedeemNow(() => setLoading(false)));
    }
  };

  const renderRedeemRewardsButton = () => {
    return (
      <div className={styles.RedeemReward}>
        <Button
          width={'100%'}
          disabled={disable}
          onClick={redeemRewards}
          isLoading={loading}
        >
          Redeem Rewards
        </Button>
      </div>
    );
  };

  const renderTooltipButton = () => {
    return disable ? (
      <TooltipCompoent toolTipText={msg} placementValue="top">
        {renderRedeemRewardsButton()}
      </TooltipCompoent>
    ) : (
      renderRedeemRewardsButton()
    );
  };

  return (
    <div className={`${styles.ReferralRewardCard} ${className}`}>
      <div
        className={styles.RewardCard}
        style={{
          backgroundImage: `url('${GRIP_INVEST_GI_STRAPI_BUCKET_URL}referEarn/referralDashboard/RewardCardBg.svg')`,
        }}
      >
        <p className="TextStyle1">Total Referral Rewards</p>
        <h3 className="Heading1">{` ₹ ${numberToCurrency(totalEarnings)}`}</h3>
        <ArrowButton
          className={styles.RewardHstoryBtn}
          onClick={redirectToHistory}
        >
          <span style={{ width: ' max-content' }}>Reward History</span>
        </ArrowButton>
      </div>
      <div className={styles.RewardList}>
        <ul>
          <li>
            <div className={`${styles.RewardItem} TextStyle1`}>
              <span className="">Redeemed</span>
              <span>{` ₹ ${numberToCurrency(redeemedEarnings)}`}</span>
            </div>
          </li>
          <li>
            <div className={`${styles.RewardItem} TextStyle1`}>
              <span>Unlocked to Redeem</span>
              <span>
                {` ₹ ${numberToCurrency(
                  totalEarnings === redeemedEarnings
                    ? 0
                    : completedDealCreditAmount
                )}`}
              </span>
            </div>
          </li>
          <li>
            <div className={`${styles.RewardItem} TextStyle1`}>
              <span>
                Locked Rewards {` `}
                <a
                  onClick={() => setShowModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  Why?
                </a>
                <MaterialModalPopup
                  showModal={showModal}
                  isModalDrawer={isMobile()}
                  handleModalClose={(res: boolean) => setShowModal(res)}
                  className={styles.popup}
                >
                  <div className={styles.popUpHeaderContainer}>
                    <Image
                      width={40}
                      height={40}
                      src={`${GRIP_INVEST_BUCKET_URL}referral/lockedRewards.svg`}
                      alt="lockedRewards"
                      layout={'intrinsic'}
                    />
                    <span className={styles.popupHeading}>Locked Rewards</span>
                  </div>
                  <div className={styles.popUpBodyContainer}>
                    <div className={styles.popUpBodyRow}>
                      <span className={styles.popUpBodyAmountType}>
                        Redemption In Process
                      </span>
                      <span>
                        ₹{' '}
                        {numberToCurrency(
                          redeemedEarnings === totalEarnings
                            ? 0
                            : pendingDebitAmount
                        )}
                      </span>
                    </div>
                    <div className={styles.popUpBodyRow}>
                      <span className={styles.popUpBodyAmountType}>
                        Not Ready For Redemption
                      </span>
                      <span>
                        ₹{' '}
                        {numberToCurrency(
                          redeemedEarnings === totalEarnings
                            ? 0
                            : liveDealCreditAmount
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.popupFooter}>
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowModal(false)}
                    >
                      GOT IT
                    </span>
                  </div>
                </MaterialModalPopup>
              </span>
              <span>
                {` ₹ ${numberToCurrency(
                  totalEarnings === redeemedEarnings
                    ? 0
                    : pendingDebitAmount + liveDealCreditAmount
                )}`}
              </span>
            </div>
          </li>
        </ul>
      </div>
      {renderTooltipButton()}
    </div>
  );
};

export default ReferralRewardCard;
