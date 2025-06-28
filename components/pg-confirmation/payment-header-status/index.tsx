import React, { useContext, useEffect, useState } from 'react';

// Context
import { PendingPgOrderContext } from '../../../pages/pg-confirmation';

// Components
import Image from '../../primitives/Image';
import Button from '../../primitives/Button';
import CustomSkeleton from '../../primitives/CustomSkeleton/CustomSkeleton';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { PaymentStatusInfo, iconStyles, paymentStatusDetail } from './utils';

// Styles
import classes from './PaymentStatus.module.css';

const getPaymentStatusInfo = ({
  paymentStatus,
  amoNextOpenDate,
  marketStatus,
  orderSettlementDate,
  isUnlistedPtc,
  isAmo,
  spvName,
  isFdOrder,
}: any): { info: PaymentStatusInfo; theme: string } => {
  const statusInfo = paymentStatusDetail({
    amoNextOpenDate,
    marketStatus,
    orderSettlementDate,
    isUnlistedPtc,
    isAmo,
    spvName,
  });

  if (paymentStatus === 'success') {
    return {
      info: isFdOrder
        ? statusInfo.payment_received_fd
        : statusInfo.payment_received,
      theme: classes.Success,
    };
  } else if (paymentStatus === 'failed') {
    return { info: statusInfo.payment_failed, theme: classes.Error };
  } else if (paymentStatus === 'pending') {
    return { info: statusInfo.payment_pending, theme: classes.Pending };
  } else if (paymentStatus === 'awaited') {
    return { info: statusInfo.payment_awaited, theme: classes.Awaited };
  }

  return { info: null, theme: '' };
};

const renderIcon = (iconType: string) => {
  const iconMap = {
    success: <span style={iconStyles.success} className="icon-tick-success" />,
    error: <span style={iconStyles.error} className="icon-info-dark" />,
    attention: <span style={iconStyles.attention} className="icon-info-dark" />,
  };
  return iconMap[iconType] || null;
};

const DesktopView: React.FC<{
  theme: string;
  loading: boolean;
  paymentStatusInfo: PaymentStatusInfo | null;
  handleCtaClick: () => void;
}> = ({ theme, loading, paymentStatusInfo, handleCtaClick }) => {
  if (loading) {
    return (
      <CustomSkeleton
        styles={{ width: '100%', height: 150 }}
        className={classes.Skeleton}
      />
    );
  }

  const { heading, subHeading, icon, cta, iconType } = paymentStatusInfo || {};

  return (
    <div className={`flex ${classes.Container} ${theme}`}>
      {iconType
        ? renderIcon(iconType)
        : icon && (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}${icon}`}
              alt="StatusIcon"
              width={40}
              height={40}
              layout="fixed"
            />
          )}

      <div className={`flex-column ${classes.Right}`}>
        {heading && <p className={classes.Heading}>{heading}</p>}
        {Array.isArray(subHeading) &&
          subHeading.map((text) => (
            <p className={classes.SubHeading} key={text}>
              {text}
            </p>
          ))}
        {cta && (
          <Button
            width="fit-content"
            className={classes.cta}
            onClick={handleCtaClick}
          >
            {cta}
          </Button>
        )}
      </div>
    </div>
  );
};

const StatusHeader: React.FC = () => {
  const data = useContext(PendingPgOrderContext);

  const {
    loading = false,
    paymentStatus = '',
    amoNextOpenDate,
    marketStatus,
    isAmo,
    spvName,
    orderSettlementDate,
    isUnlistedPtc,
    isFdOrder,
    redirectToAssets,
    handleOnClickRetry,
  } = data || {};

  const [paymentStatusInfo, setPaymentStatusInfo] =
    useState<PaymentStatusInfo | null>(null);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const { info, theme } = getPaymentStatusInfo({
      paymentStatus,
      amoNextOpenDate,
      marketStatus,
      orderSettlementDate,
      isUnlistedPtc,
      isAmo,
      spvName,
      isFdOrder,
    });
    setPaymentStatusInfo(info);
    setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paymentStatus,
    amoNextOpenDate,
    marketStatus,
    isAmo,
    spvName,
    orderSettlementDate,
  ]);

  const handleCtaClick = () => {
    if (paymentStatus === 'failed') {
      handleOnClickRetry();
    } else if (paymentStatus === 'pending') {
      redirectToAssets();
    }
  };

  if (!paymentStatusInfo) return null;

  return (
    <DesktopView
      theme={theme || ''}
      loading={loading}
      paymentStatusInfo={paymentStatusInfo}
      handleCtaClick={handleCtaClick}
    />
  );
};

export default StatusHeader;
