import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// Styles
import classes from './NeftTabPaymentModal.module.css';

// Redux
import { setOpenPaymentModal } from '../../../redux/slices/config';

// Context
import { InvestmentOverviewContext } from '../../assetAgreement/RfqInvestment';

// API
import { fetchUtrNumber } from '../../../api/order';

// Utils
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Primitives
import Image from '../../primitives/Image';
import Button, { ButtonType } from '../../primitives/Button';

// Other components
import {
  RenderBankDetailModal,
  RenderRtgsDetailList,
} from '../../confirmation/order-journey/VerticalStepper';
import UtrFormModal from '../../rfq/UtrModal';
import { isToday } from '../../../utils/dateFormatter';

// Generic Modal
const GenericModal = dynamic(
  () => import('../../user-kyc/common/GenericModal'),
  {
    ssr: false,
  }
);

const RenderViewBenificiaryBtn = ({ showBenificiaryDetail }) => {
  return (
    <Button
      width={'100%'}
      variant={ButtonType.Secondary}
      onClick={showBenificiaryDetail}
    >
      View Beneficiary Details
    </Button>
  );
};

const RenderIcon = ({ sizeIcon }) => {
  return (
    <Image
      src={`${GRIP_INVEST_BUCKET_URL}icons/PendingPayment.svg`}
      alt={'pending_payment'}
      width={sizeIcon}
      height={sizeIcon}
      layout="fixed"
    />
  );
};

const RenderTitle = ({ isTodaySettlementDate }) => {
  return isTodaySettlementDate ? (
    <h4>
      Order placed! Transfer amount <br /> payable before 2:00 PM today
    </h4>
  ) : (
    <h4>
      Order placed! <br />
      Pay offline on settlement day
    </h4>
  );
};

const RenderDetails = ({
  sizeIcon,
  isTodaySettlementDate,
  settlementDate,
  totalPayableAmount,
  showBenificiaryDetail,
  openUtrModal,
  closePaymentModal,
  utrStatus,
  btnText,
}) => {
  return (
    <div className={`flex-column ${classes.Wrapper}`}>
      <div className={classes.TitleIcon}>
        <RenderIcon sizeIcon={sizeIcon} />
        <RenderTitle isTodaySettlementDate={isTodaySettlementDate} />
      </div>
      <RenderRtgsDetailList
        settlementDate={settlementDate}
        amount={totalPayableAmount}
      />
      <RenderViewBenificiaryBtn showBenificiaryDetail={showBenificiaryDetail} />
      <Button
        width={'100%'}
        onClick={isTodaySettlementDate ? openUtrModal : closePaymentModal}
        disabled={!!utrStatus}
      >
        {btnText}
      </Button>
    </div>
  );
};

export const NeftTabDetails = () => {
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrStatus, setUtrStatus] = useState();

  const dispatch = useDispatch();

  const { totalPayableAmount, neftDetails, transactionID }: any = useContext(
    InvestmentOverviewContext
  );

  useEffect(() => {
    fetchUtrStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionID]);

  const fetchUtrStatus = async () => {
    const data = await fetchUtrNumber(transactionID);
    setUtrStatus(data?.utr);
  };

  const showBenificiaryDetail = () => setShowBeneficiaryModal(true);
  const hideBenificiaryDetail = () => setShowBeneficiaryModal(false);
  const openUtrModal = () => setShowUtrModal(true);
  const closePaymentModal = () => dispatch(setOpenPaymentModal(false));

  const { settlementDate } = neftDetails;
  const isTodaySettlementDate = isToday(settlementDate);

  const isMobile = useMediaQuery('(max-width: 992px)');
  const sizeIcon = isMobile ? 56 : 64;

  let btnText = isTodaySettlementDate
    ? 'I’ve paid via IMPS/NEFT/RTGS'
    : 'Okay, understood';

  btnText = utrStatus ? 'UTR recorded' : btnText;

  return (
    <>
      <RenderDetails
        btnText={btnText}
        closePaymentModal={closePaymentModal}
        isTodaySettlementDate={isTodaySettlementDate}
        openUtrModal={openUtrModal}
        settlementDate={settlementDate}
        showBenificiaryDetail={showBenificiaryDetail}
        sizeIcon={sizeIcon}
        totalPayableAmount={totalPayableAmount}
        utrStatus={utrStatus}
      />
      <GenericModal
        showModal={showBeneficiaryModal}
        hideIcon={true}
        drawerExtraClass={classes.Drawer}
        hideClose={false}
        handleModalClose={hideBenificiaryDetail}
      >
        <RenderBankDetailModal
          neftDetails={neftDetails}
          settlementDate={settlementDate}
          totalPayableAmount={totalPayableAmount}
        />
      </GenericModal>
      <UtrFormModal
        showModal={showUtrModal}
        setShowUtrModal={setShowUtrModal}
        handleAfterUtr={closePaymentModal}
        transactionId={transactionID}
      />
    </>
  );
};
