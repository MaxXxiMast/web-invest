import React, { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { trackEvent } from '../../../utils/gtm';
import { delay } from '../../../utils/timer';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// primitives
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// Contexts
import { DiscoverContext } from '../../../contexts/discoverContext';

// style
import classes from './AmoBanner.module.css';

// Genenric Modal
const GenericModal = dynamic(
  () => import('../../user-kyc/common/GenericModal'),
  {
    ssr: false,
  }
);

const RenderTitle = () => {
  return (
    <div className={`flex ${classes.LiveTagContainer}`}>
      <span className={classes.LiveTag} />
      <p className={classes.LiveText}>Now Live</p>
    </div>
  );
};

const RenderIcon = (props: any) => {
  const imageUrl = props?.data?.image?.url || `icons/AmoBannerIcon.svg`;
  return (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}${imageUrl}`}
      alt={'AMO Banner'}
      width={props?.data?.image?.width || 150}
      height={props?.data?.image?.height || 80}
      layout="fixed"
    />
  );
};

const RenderDescription = (props: any) => {
  return (
    <p className={classes.Description}>
      {props?.data?.bannerText ||
        'You can now place After Market Orders for Bonds and SDIs'}
    </p>
  );
};

const RenderKnowMoreBtn = (props: { onClick: () => void; data: any }) => {
  return (
    <Button
      compact
      onClick={props?.onClick}
      variant={ButtonType.Secondary}
      width={'100%'}
      className={classes.Btn}
    >
      {props?.data?.knowMoreButton?.text || 'Know More'}
    </Button>
  );
};

const RenderExploreDealsBtn = (props) => {
  return (
    <Button
      compact
      onClick={props?.onClick}
      width={'100%'}
      className={classes.Btn}
    >
      {props?.data?.exploreDealsButton?.text || 'Explore Deals'}
    </Button>
  );
};

type ButtonModel = {
  btnLink?: string;
  text?: string;
  modalTitle?: string;
  modalDescription?: string;
};

type BannerData = {
  image: {
    url: string;
    width: number;
    height: number;
  };
  bannerText: string;
  knowMoreButton?: ButtonModel;
  exploreDealsButton?: ButtonModel;
  showNowLiveText?: boolean;
};

type AmoBannerProps = {
  bannerData: BannerData;
};

export const AmoBanner = ({ bannerData }: AmoBannerProps) => {
  const [showMoreModal, setShowMoreModal] = useState(false);
  const router = useRouter();
  const {
    amo_orders_pending_pay,
    amo_orders_pending_pay_rfq,
    market_open,
    orders_pending_pay,
  } = useContext(DiscoverContext);
  const isMobile = useMediaQuery();

  const handleTrackEvent = (eventName: string) => {
    trackEvent(eventName, {
      amo_orders_pending_pay: amo_orders_pending_pay,
      amo_orders_pending_pay_rfq: amo_orders_pending_pay_rfq,
      market_open: market_open,
      orders_pending_pay: orders_pending_pay,
    });
  };

  const routeToAssetPage = async () => {
    handleTrackEvent('amo_explore_deals');
    // Added Delay because of routing can cancel the event request to rudderstack
    await delay(300);

    if (bannerData?.exploreDealsButton?.btnLink) {
      router.push(bannerData?.exploreDealsButton?.btnLink);
    } else {
      router.push('/assets');
    }
  };

  const closeShowMoreModal = () => setShowMoreModal(false);

  const handleKnowMoreBtn = () => {
    if(router.pathname === '/discover'){
      trackEvent('sell_anytime_page_entry')
      router.push('/product-detail/sell-anytime')
      return;
    } 
    
    handleTrackEvent('amo_know_more_clicked')
    
    if(bannerData?.knowMoreButton?.btnLink) {
      router.push(bannerData?.knowMoreButton?.btnLink);
    } else {
      setShowMoreModal(true);
    }
  };

  return (
    <>
      <div className={`flex-column ${classes.container}`}>
        {bannerData?.showNowLiveText && <RenderTitle />}
        <RenderIcon data={bannerData} />
        <RenderDescription data={bannerData} />
        <div className={`flex ${classes.BtnContainer}`}>
          <RenderKnowMoreBtn onClick={handleKnowMoreBtn} data={bannerData} />
          <RenderExploreDealsBtn onClick={routeToAssetPage} data={bannerData} />
        </div>
      </div>
      <GenericModal
        showModal={showMoreModal}
        title={
          bannerData?.knowMoreButton?.modalTitle ??
          'What is After Market Order?'
        }
        hideClose={!isMobile}
        subtitle={
          bannerData?.knowMoreButton?.modalDescription ??
          'After Market Order (AMO) is a special feature on Grip that allows you to invest even after regular market trading hours. Place your order 24/7 and pay right away via our RBI-regulated payment gateway partner. Both your order and payment will be settled with the NSE automatically.'
        }
        hideIcon
        btnText="Okay! Understood"
        handleModalClose={closeShowMoreModal}
        handleBtnClick={closeShowMoreModal}
      />
    </>
  );
};
