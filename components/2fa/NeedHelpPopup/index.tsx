// NODE MODULES
import { useEffect, useState } from 'react';
import dompurify from 'dompurify';

// Comonents
import Button from '../../primitives/Button';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';

// Utils
import { urlify } from '../../../utils/string';
import { fetchAPI } from '../../../api/strapi';

// Styles
import styles from './NeedHelpPopup.module.css';

const defaultNeedHelpData = {
  title: 'Need Help?',
  data: [
    'Date of Birth (DOB) should be as mentioned on your PAN card',
    'Ensure you are entering the DOB in DDMMYYYY format. For eg, your DOB is 28 May 1985, then enter 28051985',
    'If issue still persists; then mail us at support@gripinvest.in',
  ],
  buttonText: 'Try Again',
};

interface NeedHelpProps {
  handleClose: any;
  showNeedHelpModal: boolean;
}
export default function NeedHelpPopup({
  showNeedHelpModal,
  handleClose,
}: NeedHelpProps) {
  const sanitizer = dompurify.sanitize;

  const [popupDetails, setPopupDetails] = useState(defaultNeedHelpData);

  const getData = async () => {
    const data = await getServerData();
    const needHelpData =
      data?.filter((item) => item.keyValue === 'needHelpPopup')?.[0]
        ?.objectData || defaultNeedHelpData;

    setPopupDetails(needHelpData);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleClick = () => {
    // Close the modal
    handleClose(false);
  };

  const renderBody = () => {
    return (
      <div className={`flex-column ${styles.Container}`}>
        <div className={styles.heading}>{popupDetails.title}</div>
        <ul className={`flex-column ${styles.items}`}>
          {popupDetails.data.map((item) => (
            <li
              key={urlify(item)}
              className={`TitleWithDot`}
              dangerouslySetInnerHTML={{
                __html: sanitizer(item),
              }}
            />
          ))}
        </ul>
        <Button width={'100%'} onClick={handleClick}>
          {'Try Again'}
        </Button>
      </div>
    );
  };

  return (
    <MaterialModalPopup
      isModalDrawer
      hideClose
      showModal={showNeedHelpModal}
      className={styles.NeedHelpPopup}
    >
      {renderBody()}
    </MaterialModalPopup>
  );
}

async function getServerData() {
  try {
    const pageData = await fetchAPI(
      '/inner-pages-data',
      {
        filters: {
          url: '/two-fa',
        },
        populate: '*',
      },
      {},
      false
    );

    return pageData?.data?.[0]?.attributes?.pageData || [];
  } catch (e) {
    console.log(e, 'error');
    return [];
  }
}
