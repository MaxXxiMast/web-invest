// NODE MODULES
import dynamic from 'next/dynamic';

// Hooks
import withLazyLoad from '../../../utils/withLazyLoad';
import { useAppSelector } from '../../../redux/slices/hooks';

// Components
import AssetContent from '../AssetContent';
//@TODO to be removed with underlying dependencies
// import InvestMentCard from '../InvestMentCard';
import AssetTopCard from '../AssetTopCard';
import HighlightSection from '../HighlightSection';
import RepaymentStructure from '../../repayment-structure';
import AssetDetailsFold from '../AssetDetailsFold';
import AssetCalculatorWrapper from '../AssetCalculatorWrapper';
import AssetMobileButton from '../AssetMobileButton';

// Utils
import { assetStatus } from '../../../utils/asset';
import { isGCOrder } from '../../../utils/gripConnect';

// Styles
import styles from './GripLayout.module.css';

const ContactAssetDetail = dynamic(
  () => import('../../../components/assetDetails/ContactAssetDetail'),
  {
    ssr: false,
  }
);
const LazyContactAssetDetail = withLazyLoad(ContactAssetDetail);

const NewsLetter = dynamic(
  () => import('../../../components/assetDetails/NewsLetter/NewsLetter'),
  {
    ssr: false,
  }
);
const LazyNewsLetter = withLazyLoad(NewsLetter);

type Props = {
  asset: any;
  isLoggedInUser: boolean;
};
const GripLayout = ({ asset = {}, isLoggedInUser = true }: Props) => {
  const isGC = isGCOrder();
  const gcAssetDetail = useAppSelector(
    (state) => state.gcConfig?.configData?.themeConfig?.pages.assetDetail
  );
  const isShowSupportBanner = isGC ? !gcAssetDetail?.hideSupportBanner : true;
  return (
    <>
      <div className="containerNew">
        <div className={styles.AssetDetailsnner}>
          <div className={styles.AssetDetaiLeft}>
            <AssetDetailsFold />
            {/* @TODO to be removed with underlying dependencies*/}
            {/* h3 and badges only */}
            {/* <InvestMentCard pageData={localProps?.pageData} /> */}
            <AssetTopCard />
            <HighlightSection />
            {assetStatus(asset) === 'active' ? <RepaymentStructure /> : null}
            <AssetContent />
            {isShowSupportBanner &&
            (assetStatus(asset) === 'active' || isLoggedInUser) ? (
              <LazyContactAssetDetail
                className={styles.ContactAssetDetail}
                source={asset?.assetID}
                campaignName={'assetdetails'}
              />
            ) : null}
          </div>
          <AssetCalculatorWrapper />
        </div>
      </div>

      {!isLoggedInUser && assetStatus(asset) !== 'active' ? (
        <LazyNewsLetter />
      ) : null}

      <AssetMobileButton />
    </>
  );
};

export default GripLayout;
