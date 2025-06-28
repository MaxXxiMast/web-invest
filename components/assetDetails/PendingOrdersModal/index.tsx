import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';

//mui
import { CircularProgress } from '@mui/material';

// styles
import classes from './PendingOrdersModal.module.css';

//Context
import { GlobalContext } from '../../../pages/_app';

// redux
import { RFQPendingOrder } from '../../../redux/types/rfq';
import { setRFQPendingOrder } from '../../../redux/slices/orders';
import { setOpenPaymentModal } from '../../../redux/slices/config';
import { useAppSelector } from '../../../redux/slices/hooks';

// common components
import GenericModal from '../../user-kyc/common/GenericModal';

//  other components
import PendingRequestCard from './PendingRequestCard';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { getMarketStatus } from '../../../utils/marketTime';

// primitives
import Image from '../../primitives/Image';

type Props = {
  isSubmitting: boolean;
  clickOnNewOrder: () => void;
};

const RenderSubTitle = () => {
  return (
    <p>
      We recommend you pay for the below active orders before you place a new
      order
    </p>
  );
};

const RenderOrderPlaceBtn = ({
  isSubmitting = false,
  clickOnNewOrder,
}: Props) => {
  if (isSubmitting) {
    return <CircularProgress size={30} />;
  }
  return (
    <button onClick={clickOnNewOrder} className={classes.btn2}>
      Proceed with a new order
    </button>
  );
};

const RenderPendingCards = (props) => {
  const {
    pendingOrders = [],
    setOpenPaymentModal,
    setRFQPendingOrder,
    setOpenPendingOrderModal,
    handleUtrModal,
  } = props;

  const marketTiming = useAppSelector(
    (state) => state.config.marketTiming
  );
  const marketStatus = getMarketStatus(
    marketTiming?.marketStartTime,
    marketTiming?.marketClosingTime,
    marketTiming?.isMarketOpenToday
  );

  const isMarketClosed = ['closed', 'opens in'].includes(marketStatus);

  const repeatOrderPayButtonClickedEvent = (
    rfqPendingOrder: RFQPendingOrder
  ) => {
    // when pay button is clicked on repeat order nudge
    const data = {
      asset_id: rfqPendingOrder?.assetID,
      assets_shown:
        pendingOrders?.slice(0, 2)?.map((item) => item?.assetID) || [],
      amount: Number(rfqPendingOrder?.amount)?.toFixed(2),
      page: window?.location?.href,
    };

    trackEvent('repeat_order_pay_button_clicked', data);
  };

  const onClickOnPendingRFQOrder = (rfqPendingOrder: RFQPendingOrder) => {
    repeatOrderPayButtonClickedEvent(rfqPendingOrder);
    setOpenPendingOrderModal(false);
    setRFQPendingOrder(rfqPendingOrder);
    setOpenPaymentModal(true);
  };

  return (
    <>
      {pendingOrders.map((item: any) => {
        return (
          <PendingRequestCard
            {...item}
            key={`order_${item?.transactionID || ''}`}
            isMarketClosed={isMarketClosed}
            handleClick={() => onClickOnPendingRFQOrder(item)}
            handleUtrModal={() => handleUtrModal(item?.transactionID)}
          />
        );
      })}
    </>
  );
};

const RenderPortfolioBtn = (props) => {
  if (!(Array.isArray(props?.orders) && props?.orders?.length > 2)) {
    return null;
  }
  return (
    <button onClick={props?.routeToDiscover} className={classes.btn}>
      View all pending orders on discover
    </button>
  );
};

const RenderSebiGuidliance = () => {
  return (
    <div className={classes.SebiGuidliance}>
      <div>
        <Image
          src={`${GRIP_INVEST_BUCKET_URL}icons/DangerTriangle.svg`}
          width={24}
          height={24}
          alt={'info icon'}
          layout={'fixed'}
        />
      </div>
      <p>
        As per SEBI guidelines, if you fail to make payment post order
        placement, you may be debarred from the debt market for up to 15 days
      </p>
    </div>
  );
};

const PendingOrdersModal = (props) => {
  const [openPendingOrderModal, setPendingOrderModal] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showNewOrderBtn, setShowNewOrderBtn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enableDebartment } = useContext<any>(GlobalContext);

  const router = useRouter();

  const {
    pendingOrders = [],
    clickOnNewOrder,
    assetID,
    units,
    setOpenPaymentModal,
    setRFQPendingOrder,
    setOpenPendingOrderModal,
    PendingOrderModal,
    handleUtrModal,
    orderNudgeData,
  } = props;

  useEffect(() => {
    setPendingOrderModal(PendingOrderModal);
  }, [PendingOrderModal]);

  useEffect(() => {
    setPendingOrderModal(!!pendingOrders?.length);
  }, [pendingOrders]);

  useEffect(() => {
    handleOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetID, pendingOrders]);

  const proceedWithOrderClickedEvent = () => {
    //  when proceed with order button is clicked
    const data = {
      asset_id: assetID,
      units_tried: units,

      assets_shown: orders?.slice(0, 2)?.map((item) => item?.assetID) || [],
      amount: Number(props?.investmentAmount).toFixed(2),
      page: window?.location?.href,
    };

    trackEvent('proceed_with_order_clicked', data);
  };

  const repeatOrderNudgeEvent = ({ btnVisibility, allOrders }) => {
    //  when repeat_order pop-up comes on the screen
    const data = {
      asset_id: assetID,
      proceed_button_visible: btnVisibility,
      units_tried: units,
      assets_shown: allOrders?.slice(0, 2)?.map((item) => item?.assetID) || [],
      amount: Number(props?.investmentAmount).toFixed(2),
      page: window?.location?.href,
    };

    trackEvent('repeat_order_nudge', data);
  };

  const handleNewOrder = () => {
    setIsSubmitting(true);
    proceedWithOrderClickedEvent();
    clickOnNewOrder();
  };

  const sortingOrders = (orders: any[]) => {
    // Normal Pending orders> AMO RFQ-generated> AMO RFQ-not generated
    const sortingOdr = {
      nonAmoOdr: [],
      amoRfqOdr: [],
      amoNonRfqOdr: [],
    };

    orders.forEach((order) => {
      const { isAmo, rfqID } = order;
      if (!isAmo) {
        sortingOdr.nonAmoOdr.push(order);
      } else if (rfqID) {
        sortingOdr.amoRfqOdr.push(order);
      } else {
        sortingOdr.amoNonRfqOdr.push(order);
      }
    });

    return [
      ...sortingOdr.nonAmoOdr,
      ...sortingOdr.amoRfqOdr,
      ...sortingOdr.amoNonRfqOdr,
    ];
  };

  const handleOrders = () => {
    let sameAssetOrders = [];
    let differentAssetOrders = [];
    let totalAmount = props?.investmentAmount ?? 0;
    for (let i = 0; i < pendingOrders.length; i++) {
      const order = pendingOrders[i];
      totalAmount += order?.amount;
      if (order?.assetID === assetID) {
        if (order?.units === units) {
          setOrders([order]);
          repeatOrderNudgeEvent({
            btnVisibility: false,
            allOrders: [order],
          });
          return;
        }

        sameAssetOrders.push(order);
      } else {
        differentAssetOrders.push(order);
      }
    }

    sameAssetOrders = sortingOrders(sameAssetOrders);
    differentAssetOrders = sortingOrders(differentAssetOrders);

    const newOrderBtnVisibility =
      totalAmount < orderNudgeData?.maxOrderAmountGlobal &&
      sameAssetOrders?.length < orderNudgeData?.maxOrderCountPerAsset;

    setShowNewOrderBtn(newOrderBtnVisibility);

    const allOrders = [...sameAssetOrders, ...differentAssetOrders];
    setOrders(allOrders);
    repeatOrderNudgeEvent({
      btnVisibility: newOrderBtnVisibility,
      allOrders: allOrders,
    });
  };

  const routeToDiscover = () => {
    router.push('/discover');
  };

  return (
    <GenericModal
      showModal={openPendingOrderModal}
      title={'Payment pending for below order(s)'}
      drawerExtraClass={classes.Drawer}
      className={classes.Drawer}
      hideClose={false}
      hideIcon
      handleModalClose={() => setOpenPendingOrderModal(false)}
      wrapperExtraClass={classes.WrapperClass}
    >
      <RenderSubTitle />
      <RenderPendingCards
        pendingOrders={orders.slice(0, 2)}
        setOpenPaymentModal={setOpenPaymentModal}
        setRFQPendingOrder={setRFQPendingOrder}
        setOpenPendingOrderModal={setOpenPendingOrderModal}
        handleUtrModal={handleUtrModal}
      />
      <RenderPortfolioBtn orders={orders} routeToDiscover={routeToDiscover} />
      {enableDebartment ? <RenderSebiGuidliance /> : null}
      {showNewOrderBtn ? (
        <RenderOrderPlaceBtn
          clickOnNewOrder={handleNewOrder}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </GenericModal>
  );
};

const mapStateToProps = () => {};

const mapDispatchToProps = {
  setOpenPaymentModal,
  setRFQPendingOrder,
};

export default connect(mapStateToProps, mapDispatchToProps)(PendingOrdersModal);
