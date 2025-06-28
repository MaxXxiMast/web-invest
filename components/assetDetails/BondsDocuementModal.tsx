// NODE_MODULES
import React, { useContext } from 'react';

// Components
import Image from '../primitives/Image';
import Button from '../primitives/Button';

// Utils
import { mediaQueries } from '../utils/designSystem';
import { getObjectClassNames } from '../utils/designUtils';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';
import { getDocumentStatus, getNriAddressDocumentStatus } from './utils';
import { KycStepModel } from '../user-kyc/utils/models';
import {
  DocItem,
  getStatusofEachSection,
  kycSections,
  updatedKycSteps,
} from '../user-kyc/utils/helper';
import { isOBPPKYCEnabledForAsset } from '../../utils/rfq';

// Context
import { GlobalContext } from '../../pages/_app';

const classes: any = getObjectClassNames({
  BondsDocuementModal: {},
  DocImage: {
    marginBottom: 8,
    [mediaQueries.phone]: {
      marginBottom: 0,
    },
    '> span': {
      maxWidth: 72,
      maxHeight: 72,
      [mediaQueries.phone]: {
        maxWidth: 40,
        maxHeight: 40,
      },
    },
  },
  ModalHeader: {
    marginBottom: 8,
    [mediaQueries.phone]: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
  },
  ModalSubheading: {
    color: 'var(--gripLuminousGrey)',
  },
  DocList: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  DocItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  Icon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${GRIP_INVEST_BUCKET_URL}bonds/pending.svg)`,
    backgroundPosition: 'center',
  },
  CompletedIcon: {
    backgroundColor: 'var(--gripWhiteLilac, #f7f7fc)',
    backgroundImage: `url(${GRIP_INVEST_BUCKET_URL}bonds/complete.svg)`,
    border: '1px solid var(--gripMercuryThree, #e6e6e6)',
  },
  ModalBtn: {
    marginTop: 32,
  },
  statusCode: {
    color: 'var(--gripLuminousGrey)',
    marginLeft: 'auto',
  },
  KycTitle: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '20px',
    color: 'var(--gripLuminousGrey)',
  },
  TitleActive: {
    color: 'var(--gripBlue)',
  },
  TitleCompleted: {
    color: 'var(--gripLuminousDark)',
  },
  KycDesc: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: '18px',
    color: 'var(--gripLuminousGrey)',
  },
  kycStepContainer: {
    marginTop: -4,
  },
  ListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    color: 'var(--gripLuminousGrey)',
  },
  StatusCircle: {
    width: 16,
    height: 16,
    flexShrink: 0,
    border: '3px solid var(--gripHeather, #b5bdcd)',
    borderRadius: '50%',
    backgroundColor: 'var(--gripWhite, #fff)',
  },
  ActiveCircle: {
    borderColor: 'var(--gripPrimaryGreen, #00b8b7)',
  },
  PendingCircle: {
    borderColor: 'var(--gripPending, #F9B673)',
    background: `url(${GRIP_INVEST_BUCKET_URL}icons/warning-circle2.svg) var(--gripWhite, #ffffff)`,
    backgroundSize: '22px',
    backgroundPosition: 'center',
  },
  CompletedCircle: {
    borderColor: 'var(--gripPrimaryGreen, #00b8b7)',
    backgroundColor: 'var(--gripPrimaryGreen, #00b8b7)',
    background: `url(${GRIP_INVEST_BUCKET_URL}icons/check-circle.svg) var(--gripWhite, #ffffff)`,
    backgroundSize: '22px',
    backgroundPosition: 'center',
  },
  Separator: {
    position: 'relative',
    borderLeft: '1px dashed var(--gripWhiteLilac, #f7f7fc)',
    height: 40,
    left: 7,
    top: -18,
    marginBottom: -18,
  },
  CompletedSeparator: {
    borderLeft: '2px solid var(--gripPrimaryGreen, #00b8b7)',
  },
});

const DocumentArr: DocItem[] = [
  {
    label: 'PAN Card',
    id: 'pan',
  },
  {
    label: 'Address Proof',
    id: 'aadhaar',
  },
  {
    label: 'Cancelled Cheque',
    id: 'cheque',
  },
  {
    label: 'Other Details',
    id: 'others',
  },
  {
    label: 'CMR/CML',
    id: 'depository',
  },
];

const getCurrentKycStatus = (allSectionStatus: Record<string, number>) => {
  let currentKycStatus = 0;
  const kycSectionStepNames = Object.keys(kycSections);
  for (let index = 0; index < kycSectionStepNames.length; index++) {
    const kycSectionId = kycSectionStepNames[index];
    if ([1, 2].includes(allSectionStatus[kycSectionId])) {
      currentKycStatus = index + 1;
    } else {
      break;
    }
  }
  return currentKycStatus;
};

const renderDocListItem = (status: string, docName: string, itemKey: any) => {
  return (
    <div className={`${classes.DocItem}`} key={itemKey}>
      {status === 'Approved' ? (
        <div className={`${classes.CompletedIcon} ${classes.Icon}`}></div>
      ) : (
        <div className={classes.Icon}></div>
      )}
      <span className="TextStyle1">{docName}</span>
      <span className={`${classes.statusCode} TextStyle2`}>{status}</span>
    </div>
  );
};

const renderUpdatedList = (
  currentStep: any,
  kycStatus: number,
  stepStatus: number,
  index: number
) => {
  const isUnderVerification = stepStatus === 2;
  const isCompleted = stepStatus === 1;

  const getCircleClass = () => {
    let statusClass = '';

    if (isCompleted) {
      statusClass = classes.CompletedCircle;
    }

    if (isUnderVerification) {
      statusClass = classes.PendingCircle;
    }

    return `${classes.StatusCircle} ${statusClass} ${
      index === kycStatus ? classes.ActiveCircle : ''
    }`;
  };

  return (
    <React.Fragment key={`${currentStep.id}`}>
      <li className={classes.ListItem} key={`${currentStep.id}-${index}`}>
        {/* Circle */}
        <div className={getCircleClass()} />

        {/* Label and Description */}
        <div className={classes.kycStepContainer}>
          <div
            className={`${classes.KycTitle} 
          ${isUnderVerification ? classes.TitleCompleted : ''} 
          ${index === kycStatus ? classes.TitleActive : ''}`}
          >
            {`${currentStep.label} ${
              isUnderVerification ? '(Under Verification)' : ''
            }`}
          </div>
          <div className={classes.KycDesc}>{currentStep.description}</div>
        </div>
      </li>
      {/* Seperators */}
      {index !== updatedKycSteps.length - 1 && (
        <li>
          <div
            className={`${classes.Separator} 
          ${
            index < kycStatus || isCompleted || isUnderVerification
              ? classes.CompletedSeparator
              : ''
          }`}
          />
        </li>
      )}
    </React.Fragment>
  );
};

type Props = {
  userData?: any;
  handleContinueBtn?: () => void;
  rfqDocList?: KycStepModel[];
  asset?: any;
};

const BondsDocuementModal = ({
  userData = {},
  handleContinueBtn = () => {},
  rfqDocList = [],
  asset = {},
}: Props) => {
  const { obppSPVCategoryID = [] }: any = useContext(GlobalContext);
  const handleObject = (itemId: string) => {
    return itemId === 'cheque' ? userData?.userData : userData?.kycDetails;
  };

  const getOtherDetailsStatus = () => {
    const { nomineeName = '', residentialStatus } = userData?.userData;

    if (!nomineeName || !residentialStatus) {
      return 'Pending';
    }

    return 'Approved';
  };

  const renderPendingDocList = () => {
    // OBPP KYC for SDI Assets and RFQ-Bonds Assets
    if (isOBPPKYCEnabledForAsset(asset, obppSPVCategoryID)) {
      const allSectionStatus = getStatusofEachSection(rfqDocList);
      const kycStatus = getCurrentKycStatus(allSectionStatus);
      return (
        <ul>
          {updatedKycSteps.map((currentStep, index) => {
            return renderUpdatedList(
              currentStep,
              kycStatus,
              allSectionStatus[currentStep.id],
              index
            );
          })}
        </ul>
      );
    }
    return (
      <>
        {DocumentArr.map((item, index) => {
          const { residentialStatus } = userData?.userData;
          let docStatus = 'Pending';
          if (item?.id === 'others') {
            docStatus = getOtherDetailsStatus();
          } else if (item?.id === 'aadhaar' && residentialStatus === 'nri') {
            docStatus = getNriAddressDocumentStatus(handleObject(item.id));
          } else {
            docStatus = getDocumentStatus(handleObject(item.id), item.id);
          }
          return renderDocListItem(docStatus, item.label, index);
        })}
      </>
    );
  };

  return (
    <div className={classes.BondsDocuementModal}>
      <div className={classes.ModalHeader}>
        <div className={classes.DocImage}>
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}bonds/document-drawer.svg`}
            layout={'fixed'}
            alt="document drawer image"
          />
        </div>
        <h3 className={`Heading3 ${classes.ModalHeadingTitle}`}>
          Before we continue...
        </h3>
      </div>
      <p className={`TextStyle1 ${classes.ModalSubheading}`}>
        In the next few steps, we’ll ask for the following details
      </p>
      <div className={classes.DocList}>{renderPendingDocList()}</div>
      <div className={classes.ModalBtn}>
        <Button onClick={handleContinueBtn} width={'100%'}>
          Let’s Continue
        </Button>
      </div>
    </div>
  );
};

export default BondsDocuementModal;
