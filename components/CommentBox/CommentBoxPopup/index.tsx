// NODE MODULES
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Skeleton from '@mui/material/Skeleton';

// Components
import CommentBoxForm, { CommentBoxFormData } from '../CommentBoxForm';
import MaterialModalPopup from '../../primitives/MaterialModalPopup';
import GenericModal from '../../user-kyc/common/GenericModal';
import PoweredByGrip from '../../primitives/PoweredByGrip';

// Redux Slices
import { setOpenCommentBox } from '../../../redux/slices/rfq';
import { RootState } from '../../../redux';

// APIS
import { handleKycStatus } from '../../../api/rfqKyc';

// Utils
import { getKycStepStatus } from '../../user-kyc/utils/helper';
import { kycStepCountMapping } from '../../../utils/kycEntryPoint';
import { trackEvent } from '../../../utils/gtm';
import { delay } from '../../../utils/timer';
import { handleRedirection, sortingEntryBannerArr } from '../utils';
import { isGCOrder } from '../../../utils/gripConnect';

// Types
import type { KycStatusResponseModel } from '../../user-kyc/utils/models';

// Styles
import styles from './CommentBox.module.css';

const CommentBox = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isGC = isGCOrder();
  const { userID } = useSelector((state: RootState) => state?.user.userData);
  const { gcCallbackUrl } = useSelector(
    (state: RootState) => state?.gcConfig?.gcData
  );

  const [type, setType] = useState<string>('');
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openCommentModal, setOpenCommentModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommentBoxFormData>({
    comment: '',
    type: '',
  });

  const handleCloseModal = async (
    ctaClicked: string,
    isFinalRedirect = false
  ) => {
    trackEvent('KYC_HELP_CLOSE', {
      cta_clicked: ctaClicked,
      userID: userID,
      page: router.pathname,
      module_stuck:
        document.getElementById('IssueType')?.innerHTML ??
        formData?.type ??
        null,
      message_written:
        document.getElementById('IssueComment')?.innerHTML ??
        formData?.comment ??
        null,
    });
    // Added Delay so that it should not cancel the event call
    await delay(500);
    setOpenSuccessModal(false);
    setOpenCommentModal(false);
    dispatch(setOpenCommentBox(false));
    if (isGC || (isFinalRedirect && router.pathname === '/user-kyc')) {
      router.push(handleRedirection(gcCallbackUrl));
    }
  };

  const onSuccessSubmit = (data) => {
    setFormData(data);
    if (isGC) {
      router.push(handleRedirection(gcCallbackUrl));
    } else {
      setOpenSuccessModal(true);
    }
    setOpenCommentModal(false);
  };

  useEffect(() => {
    async function getLatestKYCData() {
      setLoading(true);
      const data = await handleKycStatus();
      // find the data which status has status 0
      const kycStatusArr: KycStatusResponseModel[] = data?.kycTypes;

      let stepStatusArr = getKycStepStatus(kycStatusArr);
      stepStatusArr = sortingEntryBannerArr(stepStatusArr);

      const statusArr = stepStatusArr.find(
        (ele) => ele.status === 0 && ele?.name !== 'pan'
      );
      if (statusArr?.name) {
        setType(String(kycStepCountMapping?.[statusArr?.name] ?? 'address'));
      } else {
        setType('address');
      }
      setLoading(false);
    }

    getLatestKYCData();
  }, []);

  const renderBody = () => {
    return (
      <>
        <div className={`flex  items-center ${styles.titleHeading}`}>
          Need help with KYC?
          {isGCOrder() ? (
            <span className={styles.poweredBy}>
              <PoweredByGrip />
            </span>
          ) : null}
        </div>
        {loading ? (
          <div className={` ${styles.CommentBoxSkeletonContainer}`}>
            <Skeleton height={57} />
            <Skeleton height={124} />
            <Skeleton height={15} width={100} />
            <Skeleton height={48} />
          </div>
        ) : (
          <CommentBoxForm type={type} onSuccessSubmit={onSuccessSubmit} />
        )}
      </>
    );
  };

  return (
    <>
      <MaterialModalPopup
        isModalDrawer
        showModal={openCommentModal}
        handleModalClose={() => handleCloseModal('CLOSE_ICON')}
        className={styles.CommentBoxModal}
        closeButtonClass={styles.CloseBtn}
      >
        {renderBody()}
      </MaterialModalPopup>
      <GenericModal
        showModal={openSuccessModal}
        lottieType={'completed'}
        title={'Your issue has been raised'}
        subtitle={
          'We are sorry for the inconvenience. We are looking into this and will send an update to your registered email id from support@gripinvest.in'
        }
        icon={'check-circle.svg'}
        btnText={'Okay'}
        handleBtnClick={() => handleCloseModal('Okay', true)}
        wrapperExtraClass={styles.successModal}
      />
    </>
  );
};

export default CommentBox;
