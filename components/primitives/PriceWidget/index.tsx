import { useAppSelector } from '../../../redux/slices/hooks';
import { handleExtraProps } from '../../../utils/string';
import { isHideCutOut } from '../AssetCard/utils';
import styles from './PriceWidget.module.css';

type PriceWidgetProps = {
  originalValue: string;
  cutoutValue: string;
  isNegative?: boolean;
  isCampaignEnabled?: boolean;
  classes?: Partial<{ cutOutValueClass: string; mainValueClass: string }>;
  imageSize?: number;
  irrDroppingDate?: Date | null;
  id?: string;
};

export default function PriceWidget({
  isNegative = false,
  originalValue,
  cutoutValue,
  irrDroppingDate = null,
  isCampaignEnabled = false,
  id = '',
  classes = {
    cutOutValueClass: '',
    mainValueClass: '',
  },
  imageSize = 17,
}: PriceWidgetProps) {
  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const getMainValueStyle = () => {
    return isCampaignEnabled
      ? `${
          id === 'brokerageFees' ? styles.cutOut : styles.MainValueCutOut
        } ${handleExtraProps(classes?.mainValueClass)}`
      : '';
  };

  const shouldHideCutOut = isHideCutOut(irrDroppingDate, asset);

  return (
    <div className={'items-align-center-row-wise'}>
      {shouldHideCutOut && id === 'returns' ? null : (
        <span className={getMainValueStyle()}>
          {isCampaignEnabled ? cutoutValue : originalValue}
        </span>
      )}

      {isCampaignEnabled ? (
        <span
          className={`${
            id === 'brokerageFees' ? '' : styles.CutOutValue
          } ${handleExtraProps(classes?.cutOutValueClass)}`}
        >
          &nbsp;{originalValue}
        </span>
      ) : null}

      {isCampaignEnabled && !shouldHideCutOut && id !== 'brokerageFees' ? (
        <span
          className={`${styles.ArrowImage} ${
            isNegative ? styles.NegativeCutOut : ''
          }`}
        >
          <span className={`icon-arrow-up ${styles.Arrow}`}></span>
        </span>
      ) : null}
    </div>
  );
}
