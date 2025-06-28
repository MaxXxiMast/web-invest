import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

import { fetchTransactionHistory } from '../../redux/slices/referral';
import { useAppDispatch } from '../../redux/slices/hooks';
import { RootState } from '../../redux';
import { getUserKycDocuments } from '../../redux/slices/user';

import Retry from '../../components/investment-success/retry';
import { retryPayment } from '../../redux/slices/orders';

import {
  absoluteCommittedInvestment,
  generateAgreementURL,
  getAssetPartnersName,
} from '../../utils/asset';
import { trackEvent } from '../../utils/gtm';
import { isUserLogged } from '../../utils/user';
import { useMediaQuery } from '../../utils/customHooks/useMediaQuery';
import { isEmpty } from '../../utils/object';

const Investmentfailure: NextPage = (props: any) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const didMount = useRef(false);
  const isMobile = useMediaQuery();

  useEffect(() => {
    didMount.current = true;
    dispatch(fetchTransactionHistory());
    if (isEmpty(props?.order)) router.push('/assets');
    if (isUserLogged()) {
      props.getUserKycDocuments(props?.user?.userData?.userID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loadingRetry, setLoadingRetry] = useState(false);

  const redirecttoAssets = () => {
    if (isUserLogged()) {
      router.push('/assets');
    } else {
      router.push('/login');
    }
  };

  const retryText = () => {
    return 'Apologies for the inconvenience, any money debited, will be refunded in 5-7 working days.';
  };
  const retryFailedPayment = () => {
    setLoadingRetry(true);
    const asset = props?.selectedAsset || {};
    const amount = props?.order?.amount || '';
    const {
      assetPartners = [],
      tenure = '',
      irr = '',
      assetID = '',
      name = '',
      financeProductType = '',
    } = asset;

    let isCombo = assetPartners?.length > 1;
    let completedPercentage = absoluteCommittedInvestment(asset, false);
    let partnerNames = getAssetPartnersName(asset);

    // Rudderstack analytics `retry_payment`
    const rudderData = {
      amount: amount,
      is_adding_money: false,
      is_combo: isCombo,
      partner_names: partnerNames,
      completed_percentage: completedPercentage,
      tenure: tenure,
      irr: irr,
      asset_id: assetID,
      asset_name: name,
      financeProductType: financeProductType,
    };
    trackEvent('retry_payment', rudderData);
    const assetDetailsUrl = generateAgreementURL(
      asset,
      props?.order?.units ? props?.order?.units : props?.order?.amount
    );
    window.open(assetDetailsUrl, '_self');
  };

  const desktopView = () => {
    return (
      <Retry
        gotoAssets={redirecttoAssets}
        text={retryText()}
        retryClick={retryFailedPayment}
        loadingRetry={loadingRetry}
      />
    );
  };
  const mobileView = () => {
    return (
      <Retry
        gotoAssets={redirecttoAssets}
        text={retryText()}
        retryClick={retryFailedPayment}
        loadingRetry={loadingRetry}
      />
    );
  };
  return isMobile ? mobileView() : desktopView();
};

const mapStateToProps = (state: RootState) => ({
  loading: state.assets.loading.active,
  order: state.orders.selectedOrder,
  selectedAsset: state.assets.selectedAsset || {},
  user: state.user,
});

const mapDispatchToProps = {
  retryPayment,
  getUserKycDocuments,
};

export default connect(mapStateToProps, mapDispatchToProps)(Investmentfailure);
