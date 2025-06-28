// NODE MODULES
import { useRouter } from 'next/router';

// Components
import PartnerLogo from '../../assetsList/partnerLogo';
import Button, { ButtonType } from '../Button';
import Image from '../Image';
import PriceWidget from '../PriceWidget';

// Utils
import { generateAssetURL } from '../../../utils/asset';
import {
  getDiscoveryAssetBadges,
  getDiscoveryAssetInfo,
  getProductTypeLabel,
} from '../../../utils/discovery';
import { trackEvent } from '../../../utils/gtm';
import { handleStringLimit, urlify } from '../../../utils/string';

// Styles
import classes from './AssetCardComponent.module.css';

type Props = {
  asset: any;
  isPastDeal?: boolean;
  isDiscoveryPage?: boolean;
  isPersona?: boolean;
};

type BadgeModel = {
  label?: string;
  image?: string;
  imageIcon?: string;
};
const AssetCardComponent = ({
  asset,
  isPastDeal = false,
  isDiscoveryPage = true,
  isPersona = false,
}: Props) => {
  const badgeArr: BadgeModel[] = getDiscoveryAssetBadges(asset);
  const router = useRouter();
  const assetInfoArr: any[] = asset ? getDiscoveryAssetInfo(asset) : [];

  const handleDealClick = () => {
    const dataToTrack = {
      url: router.pathname,
      assetID: asset?.assetID,
      repeatInvestorPercentage: asset?.repeatInvestorPercentage,
    };

    if (isPersona) {
      trackEvent('personality_deal_card_clicked', {
        section: 'discover',
        assetId: asset?.assetID,
        assetName: asset?.name,
      });
    }

    trackEvent('Viewed_Asset', dataToTrack);
    if (asset?.link) router.push(asset?.link);
    else router.push(generateAssetURL(asset));
  };

  const convertToSingleString = (value: string) => {
    if (value) {
      const stringArr = value.trim().split(' ');
      return stringArr.join('');
    }
    return '';
  };

  if (!asset) {
    return null;
  }

  return (
    <div className={classes.AssetCardComponent} onClick={handleDealClick}>
      <div className={classes.CardHeader}>
        <div className={classes.HeaderLeft}>
          <PartnerLogo
            asset={{
              financeProductType:
                asset?.financeProductType || asset?.productCategory,
              partner: {
                name: asset?.partner?.name || asset?.partnerName,
                logo: asset?.partner?.logo || asset?.logo,
              },
            }}
            showUnit={false}
            showLot={false}
            height={35}
            width={140}
            isDiscoveryPage={isDiscoveryPage}
            partnershipTextClass={classes.DiscoverPartnerShipText}
          />
        </div>
        <div className={classes.HeaderRight}>
          <div
            className={`${classes.ProductType} ${convertToSingleString(
              asset?.financeProductType || asset?.productCategory
            )}`}
          >
            {
              getProductTypeLabel[
                asset?.financeProductType || asset?.productCategory
              ]
            }
          </div>
        </div>
      </div>
      <div className={`${classes.AssetDescription}`}>
        {handleStringLimit(asset?.description, 75)}
      </div>
      <div className={classes.CardBody}>
        {assetInfoArr.length > 0 &&
          assetInfoArr.map((ele: any) => {
            return (
              <div
                className={classes.AssetInfo}
                key={`assetDetail__${ele?.label}`}
              >
                {ele?.icon ? (
                  <div className={classes.AssetInfoImage}>
                    <Image
                      src={ele?.icon}
                      width={16}
                      height={16}
                      alt={`${ele.icon}-image`}
                    />
                  </div>
                ) : null}
                <h5>
                  <PriceWidget
                    isCampaignEnabled={ele?.isCampaignEnabled}
                    originalValue={`${ele?.value}${ele?.suffix ?? ''}`}
                    cutoutValue={`${ele?.cutoutValue}${ele?.suffix ?? ''}`}
                    isNegative={ele?.isNegative}
                    imageSize={0}
                    classes={{
                      mainValueClass: classes.MainValueCutOut,
                      cutOutValueClass: classes.CutOutValue,
                    }}
                  />
                </h5>
                <p>{ele?.label}</p>
              </div>
            );
          })}
      </div>
      {!isPastDeal && (
        <div className={classes.CardFooter}>
          <div className={classes.FooterLeft}>
            {badgeArr.length > 0 &&
              badgeArr.map((ele: BadgeModel) => {
                return (
                  <div className={classes.Flag} key={`${urlify(ele.label)}`}>
                    {ele.imageIcon ? (
                      <span
                        className={`${ele.imageIcon} ${classes.iconBadge}`}
                      />
                    ) : (
                      <Image
                        src={ele.image}
                        width={13}
                        height={13}
                        layout="fixed"
                        alt={ele.label || ''}
                      />
                    )}
                    <span className={classes.RepeatInvestor}>{ele.label}</span>
                  </div>
                );
              })}
          </div>
          <div className={classes.FooterRight}>
            <Button
              variant={ButtonType.Primary}
              width=""
              className={classes.DealBtn}
              onClick={handleDealClick}
            >
              Invest Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCardComponent;
