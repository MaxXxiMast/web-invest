import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import Image from '../../../primitives/Image';

import { setAssetsSort } from '../../../../redux/slices/config';

import { navigationConstantsMapping } from './utils';

import styles from './InvestmentOptionsCard.module.css';

type Props = {
  data: any;
  elementKey: string;
};

function InvestmentOptionsCard({ data, elementKey }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();

  const getIsNew = () =>
    data?.tagText ? (
      <div className={`flex_wrapper ${styles.newTagContainer}`}>
        <span className={data?.className} aria-hidden="true"></span>
        {data?.tagText}
      </div>
    ) : null;

  const handleAssetCardClick = () => {
    dispatch(
      setAssetsSort({
        tabSection: data?.id,
        tab: 'active',
        sortType: 'default',
      })
    );

    router.push(`/assets#active#${navigationConstantsMapping[data?.id]}`);
  };

  return (
    <div
      key={elementKey}
      className={`flex-column width100 ${styles.cardContainer} ${
        data?.tagText ? styles.NewAsset : ''
      }`}
      onClick={handleAssetCardClick}
    >
      {getIsNew()}

      <div className={`flex width100 ${styles.assetImageContainer}`}>
        <Image
          src={data?.icon}
          layout={'fixed'}
          width={72}
          height={72}
          alt={'assetIcon'}
        />
      </div>

      <div className={styles.assetDetailsContainer}>
        <h4 className={styles.assetTitle}>{data?.assetName}</h4>
        <ul className={styles.list}>
          {(data?.dataPoints || []).map((ele: string) => {
            return (
              <li key={ele} className={styles.listItem}>
                {ele}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default InvestmentOptionsCard;
