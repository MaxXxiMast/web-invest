// primitives
import Button, { ButtonType } from '../../primitives/Button';
import Image from '../../primitives/Image';

// utils
import {
  GRIP_INVEST_BUCKET_URL,
  handleStringLimit,
} from '../../../utils/string';

// style
import classes from './PersonaAssetCard.module.css';

type PersonaAssetCardProps = {
  partnerLogo: string;
  partnerName: string;
  assetData: {
    label: string;
    value: string;
  }[];
  handleClick: () => void;
  buttonText: string;
};

export default function PersonaAssetCard({
  assetData,
  buttonText,
  partnerLogo,
  handleClick,
  partnerName,
}: PersonaAssetCardProps) {
  return (
    <div className={classes.InvestCard}>
      <div className={`justify-between flex ${classes.CardTop}`}>
        <div className={`${classes.headerLeft} `}>
          <div
            className={`items-align-center-row-wise justify-between ${classes.InvestmentCardIcon}`}
          >
            {partnerLogo && (partnerLogo as string).includes('https') ? (
              <Image
                src={partnerLogo}
                width={108}
                height={41}
                layout="fixed"
                alt={'Partner Logo'}
                className={classes.LogoImage}
              />
            ) : (
              <span className={classes.PartnerName} title={partnerName}>
                {handleStringLimit(partnerName, 10)}
              </span>
            )}

            <Image
              src={`${GRIP_INVEST_BUCKET_URL}icons/DiagonalGreyArrow.svg`}
              width={24}
              height={24}
              layout="fixed"
              alt={'Arrow Icon'}
            />
          </div>

          <div className={classes.AssetCardContainer}>
            {assetData?.map((asset) => (
              <div
                key={`asset-${asset?.label}`}
                className={`flex-column ${classes.ValueItem}`}
              >
                <span>{asset?.label}</span>
                <span>{asset?.value}</span>
              </div>
            ))}
          </div>

          <Button
            width={'100%'}
            className={classes.Button}
            onClick={handleClick}
            variant={ButtonType.PrimaryLight}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
