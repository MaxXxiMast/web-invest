// Components
import { ButtonType } from '../../../primitives/Button';
import FilterCardUI from '../FilterCardUI';

// Types
import {
  resetFiltersWithLoading,
  setShowFilterModal,
} from '../AssetFilterSlice/assetFilters';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../../redux/slices/hooks';
import { getProductTypeFromTitle } from '../utils';

type FilterCardProps = {
  productTypeTitle: string;
  totalAssetsLen: number;
  filteredAssetsLen: number;
};

export default function FilterCard({
  productTypeTitle,
  totalAssetsLen,
  filteredAssetsLen
}: FilterCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const productType = getProductTypeFromTitle(productTypeTitle);

  const handleClickReset = () => {
    dispatch(resetFiltersWithLoading());
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      `${router.pathname}#active#${productType
        .toLowerCase()
        .replace(/\s+/g, '')}`,
      { shallow: true }
    );
  };

  const handleClickChangeFilter = () => {
    dispatch(setShowFilterModal(true));
  };

  let heading = `${filteredAssetsLen} of ${totalAssetsLen} ${productType} match your filters!`;

  if (productType === 'SDI Secondary') {
    heading = 'Filter(s) Applied';
  }
  return (
    <FilterCardUI
      heading={heading}
      subHeading={
        'Try adjusting filters to discover more investment opportunities'
      }
      buttons={[
        {
          label: 'Reset Filter',
          onClick: handleClickReset,
          variant: ButtonType.PrimaryLight,
        },
        {
          label: 'Change Filter',
          onClick: handleClickChangeFilter,
        },
      ]}
    />
  );
}
