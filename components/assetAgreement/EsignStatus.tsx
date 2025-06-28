import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';

import { getObjectClassNames } from '../utils/designUtils';

import Image from '../primitives/Image';

import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

import { mediaQueries } from '../utils/designSystem';
import { RootState } from '../../redux';
import {
  fetchAndSetAifDocs,
  getUserKycDocuments,
  initateSpvAgreementEsign,
  validateAgreementsEsign,
  verifyAifAgreements,
} from '../../redux/slices/user';
import {
  fetchAndSetAgreementPDF,
  fetchAndSetOneTimeAgreements,
} from '../../redux/slices/assets';
import { snakeCase } from 'lodash';
import { CircularProgress } from '@mui/material';
import { callErrorToast } from '../../api/strapi';
import BackdropComponent from '../common/BackdropComponent';
import { getDocumentDetails } from '../../redux/slices/orders';
import { isMobile } from '../../utils/resolution';
import { trackEvent } from '../../utils/gtm';

const ESIGN_LOADING_TIME = 3 * 1000;

const classes: any = getObjectClassNames({
  newOrderButtonCompleted: {
    justifyContent: 'end',
    alignItems: 'center',
    width: 'auto',
    [mediaQueries.phone]: {
      marginLeft: 'auto',
      flexShrink: 0,
    },
    [mediaQueries.desktop]: {
      marginLeft: 'auto',
      padding: '12px 16px',
    },
  },
  verifiedIcon: {
    width: 20,
    height: 20,
  },
  completedText: {
    fontWeight: 900,
    lineHeight: '12px',
    marginLeft: 8,
    fontSize: 12,
  },
  esignAgreementText: {
    fontSize: 20,
    lineHeight: '28px',
    fontWeight: 700,
    color: '#282C3F',
    alignSelf: 'flex-start',
    [mediaQueries.nonDesktop]: {
      marginTop: 32,
      fontSize: 18,
      lineHeight: '24px',
    },
  },
  esignListCard: {
    background: '#FFFFFF',
    margin: '12px 0',
    width: 'auto',
    minWidth: '100%',
    [mediaQueries.desktop]: {
      padding: '0px 16px',
      margin: '20px 0 20px 0',
      border: '1px solid var(--gripWhiteLilac, #f7f7fc)',
      borderRadius: 12,
      minWidth: 490,
    },
  },
  esignLabel: {
    fontFamily: 'var(--fontFamily)',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '24px',
    color: '#282C3F',
    [mediaQueries.phone]: {
      fontSize: 14,
      fontWeight: 400,
    },
  },
  esignSubLabel: {
    fontFamily: 'var(--fontFamily)',
    fontSize: 14,
    fontWeight: 400,
    marginTop: 4,
    width: 'max-content',
    lineHeight: '24px',
    color: '#555770',
    [mediaQueries.nonDesktop]: {
      display: 'none',
    },
  },
  esignRow: {
    padding: '16px 0',
    '&:not(:first-child)': {
      borderTop: '1px solid  var(--gripWhiteLilac, #f7f7fc)',
    },
    [mediaQueries.phone]: {
      padding: 12,
      margin: '8px 0',
      border: '1px solid var(--gripWhiteLilac, #f7f7fc)',
      borderRadius: 12,
    },
    '> span': {
      flexShrink: 0,
      [mediaQueries.phone]: {
        width: '28px !important',
        height: '28px !important',
      },
    },
  },
  esignText: {
    margin: '0 8px',
    width: 'auto',
    [mediaQueries.desktop]: {
      maxWidth: 244,
    },
    [mediaQueries.phone]: {
      paddingRight: 20,
      maxWidth: '100%',
      marginRight: 0,
    },
  },
  newOrderButton: {
    fontFamiy: 'Inter',
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 18,
    border: '1px solid #00357C',
    padding: '8px 12px',
    lineHeight: '20px',
    color: '#00357C',
    [mediaQueries.nonDesktop]: {
      fontSize: 12,
    },
  },

  newOrderContainer: {
    borderRadius: 8,
    width: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '12px 16px',
    cursor: 'pointer',
    fontFamily: 'var(--fontFamily)',

    [mediaQueries.nonDesktop]: {
      padding: '12px 0px',
    },
    [mediaQueries.desktop]: {
      marginLeft: 'auto',
      paddingLeft: 30,
    },
    [mediaQueries.phone]: {
      marginLeft: 'auto',
    },
  },
  newOrderIcon: {
    width: 12,
    height: 12,
    marginLeft: 16,
    color: '#00357C',
    [mediaQueries.nonDesktop]: {
      marginLeft: 8,
      width: 8,
    },
  },
  disabledButton: {
    cursor: 'unset',
    backgroundColor: 'rgba(13, 23, 36, 0.32) !important',
    color: 'white !important',
    border: 'none !important',
    pointerEvents: 'none',
    padding: '12px 16px',
    [mediaQueries.phone]: {
      padding: '8px 8px',
    },
  },
  disabledText: {
    color: 'white !important',
    backgroundColor: 'rgba(13, 23, 36, 0.32) !important',
  },
  divider: {
    margin: '16px 0',
    [mediaQueries.desktop]: {
      margin: '8px 0 28px 0',
      background: 'var(--gripWhiteLilac, #f7f7fc)',
      width: '100%',
      height: 1,
    },
  },
});

const mapDispatchToProps = {
  initateSpvAgreementEsign,
  validateAgreementsEsign,
  verifyAifAgreements,
  fetchAndSetAifDocs,
  fetchAndSetAgreementPDF,
  fetchAndSetOneTimeAgreements,
  getUserKycDocuments,
  getDocumentDetails,
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
  aifDocuments: state.user.aifDocuments || [],
  userPortfolio: state.user.portfolio.list,
  selectedAsset: state.assets.selectedAsset,
  oneTimeAgreements: state.assets?.oneTimeAgreements,
  access: state.access,
});

const connector = connect(mapStateToProps, mapDispatchToProps);

interface EsignStatusProps extends ConnectedProps<typeof connector> {
  asset: any;
  amount: number;
  onClickEvent: (name: string, data?: any) => void;
}

const EsignStatus: React.FC<EsignStatusProps> = (props) => {
  const [loading, setLoading] = useState(true);
  const [agreementsToRender, setAgreementsToRender] = useState([]);
  const [documentLoading, setDocumentLoading] = useState<any>('');

  /**
   * @description this function will return all the necessary agreements that need to be signed for a particular SPV and corresponding SPV type
   */
  const getAgreementsToRender = () => {
    //these are the agreements uploaded in the SPV
    const agreementDocs = props?.selectedAsset?.spvAgreements || [];
    const agreementIDs = agreementDocs.map((e: any) => e.id);

    //these are the agreements that need to be signed only once for a particular SPV
    const oneTimeAgreements = props?.oneTimeAgreements || [];

    //this will filter out the agreements that need to be signed once, and ignore it, if it already exists in agreementDocs
    const agreements = oneTimeAgreements.filter((e: any) => {
      return !agreementIDs.find((id: number) => +id === +e.agreementPdfs.id);
    });
    const signOnceAgreements = agreements.map((agreement: any) => {
      const agreementPdfs = agreement.agreementPdfs;
      return {
        ...agreementPdfs,
        spvDocument: agreement,
      };
    });
    // if deal is IF/LF then check whether a user has signed investment agreement or not
    let investmentAgreements: any = [];
    if (isLFIFAndHasLLp()) {
      investmentAgreements.push({
        id: 103,
        spvDocument: {
          displayName: 'Investment Agreement',
          spvID: props.asset?.spvID,
          assetID: props.asset?.assetID,
        },
      });
    }

    //combine and return all the agreements that need to be signed
    setAgreementsToRender(
      agreementDocs?.concat(signOnceAgreements)?.concat(investmentAgreements)
    );
  };

  useEffect(() => {
    getAgreementsToRender();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const isLFIFAndHasLLp = () => {
    return Number(props.asset?.hasLlp) === 1;
  };

  const stopEsignLoading = () => {
    setLoading(false);
    setDocumentLoading(false);
  };

  const verifyEsignDetails = (data: any, fileName: string) => {
    PubSub.publish('openDigio', {
      type: 'order',
      openDigioModal: true,
      data: {
        ...data,
        fileName,
      },
      onEsignDone: () => props.getUserKycDocuments(props.access?.userID),
      onEsignCancel: () => stopEsignLoading(),
    });
    setTimeout(() => {
      stopEsignLoading();
    }, ESIGN_LOADING_TIME);
  };
  const initiateInvestmentAgreement = (formID: string) => {
    setLoading(true);
    setDocumentLoading(formID);
    const fileName = `Unsigned_${props.user.userData?.firstName}_${props.asset.assetName}`;
    props.getDocumentDetails(
      props.asset?.assetID,
      verifyEsignDetails,
      failedEsign,
      fileName
    );
  };

  const initiateEsignAif = (type: string, formID: number) => {
    setLoading(true);
    setDocumentLoading(formID);
    const agreementDocs = agreementsToRender;
    const agreementDoc: any = agreementDocs.find(
      (entry: any) => entry.id === formID
    );
    const fileName = `${type}.pdf`;
    props.initateSpvAgreementEsign(
      {
        formID,
        amount: props.amount,
        type: type,
        fileName,
        signOnce: agreementDoc && agreementDoc?.signOnce,
      },
      verifyAifEsign,
      failedEsign
    );
  };

  const verifyAifEsign = (data: any, type?: string) => {
    const { user, asset } = props;
    PubSub.publish('openDigio', {
      type: type || '',
      openDigioModal: true,
      data: {
        ...data,
        userID: user?.userData?.userID,
        assetID: data.signOnce ? '' : asset.assetID,
        spvID: data.signOnce ? asset.spvID : '',
      },
      onEsignDone: onEsignDone,
    });
    setTimeout(() => {
      stopEsignLoading();
    }, ESIGN_LOADING_TIME);
  };

  const onEsignDone = async (params: any) => {
    const { asset = {} } = props || {};
    const data = {
      doc_name: snakeCase(params?.type),
      assetID: asset?.assetID,
      userID: props.access?.userID,
      createdAt: new Date(),
      financeProductType: asset?.financeProductType,
    };
    // send rudderstack event
    trackEvent('esign', data);
    setLoading(true);
    await props.validateAgreementsEsign(params);
    await props.fetchAndSetAifDocs();
    setLoading(false);
    setDocumentLoading('');
  };

  const failedEsign = (msg: string) => {
    callErrorToast(msg);
    setLoading(false);
    setDocumentLoading('');
  };

  const renderEsignDone = () => {
    return (
      <div className={`flex ${classes.newOrderButtonCompleted}`}>
        <Image
          className={classes.verifiedIcon}
          src={`${GRIP_INVEST_BUCKET_URL}commons/Tick.svg`}
          alt="tick"
          layout={'intrinsic'}
          height={20}
          width={20}
        />
        <div className={classes.completedText}>DONE</div>
      </div>
    );
  };

  const isEsignDone = (agreementDoc: any) => {
    const { aifDocuments } = props;
    const { documents } = props?.user?.userData;
    const list = props?.userPortfolio || [];
    const signedDocuments = documents?.filter(
      (a: any) =>
        Number(a.docSubType) === Number(props.asset.assetID) &&
        a.docType === 'order'
    );
    if (isLFIFAndHasLLp()) {
      const orderAsset = list?.find(
        (a: any) => a.assetID === Number(props.asset.assetID)
      );
      const { isEsigned = false } = orderAsset || {};

      return signedDocuments?.length || isEsigned;
    }

    if (!aifDocuments.length) {
      return false;
    }
    return aifDocuments.find((e: any) => {
      return String(e.docSubType) === String(agreementDoc?.spvDocument?.docID);
    });
  };

  const initateEsign = (esignDone: boolean, spvDoc: any, agreementDoc: any) => {
    if (isLFIFAndHasLLp()) {
      return initiateInvestmentAgreement(agreementDoc.id);
    }
    return (
      !esignDone &&
      initiateEsignAif(snakeCase(spvDoc.displayName), agreementDoc.id)
    );
  };

  const renderEsignPending = (agreementDoc: any, index: number) => {
    const toRenderAgreements = agreementsToRender;
    const spvDoc = agreementDoc?.spvDocument || null;
    const esignDone =
      index !== 0 ? !isEsignDone(toRenderAgreements[index - 1]) : false;
    return (
      <div
        className={`flex ${classNames(classes.newOrderContainer)}`}
        onClick={() => {
          initateEsign(esignDone, spvDoc, agreementDoc);
        }}
      >
        <div
          className={classNames(classes.newOrderButton, {
            [classes.disabledText]: esignDone,
          })}
        >
          {Number(documentLoading) === Number(agreementDoc.id) ? (
            <CircularProgress size={12} />
          ) : (
            'eSign'
          )}
        </div>
      </div>
    );
  };

  const renderEsignWithStatus = (agreementDoc: any, index: number) => {
    const esignAifDone = !isEsignDone(agreementDoc);
    return esignAifDone
      ? renderEsignPending(agreementDoc, index)
      : renderEsignDone();
  };

  const renderSpvAgreement = () => {
    const toRenderAgreements = agreementsToRender || [];
    toRenderAgreements.sort(
      (a: any, b: any) =>
        a?.spvDocument?.displayOrder - b?.spvDocument?.displayOrder
    );
    return toRenderAgreements.map((agreementDoc: any, index: number) => {
      const spvDoc = agreementDoc?.spvDocument || null;
      return spvDoc ? (
        <div
          key={`spv-agreement-${agreementDoc?.spvDocument?.docID}`}
          className={`items-align-center-row-wise ${classes.esignRow}`}
        >
          {!isMobile() && (
            <Image
              src={`${GRIP_INVEST_BUCKET_URL}dealsV2/esign.svg`}
              layout={'fixed'}
              width={32}
              height={32}
              alt='esign logo'
            />
          )}
          <div className={`flex-column ${classes.esignText}`}>
            <div className={classes.esignLabel}>
              {'eSign'} {spvDoc.displayName}
            </div>
            <div className={classes.esignSubLabel}>
              Consent to invest in this opportunity
            </div>
          </div>
          {renderEsignWithStatus(agreementDoc, index)}
        </div>
      ) : null;
    });
  };

  return (
    <>
      <BackdropComponent open={loading} />
      <div className={classes.esignAgreementText}>eSign Few Agreements</div>
      <div className={`flex-column ${classes.esignListCard}`}>
        {renderSpvAgreement()}
      </div>
      <div className={classes.divider} />
    </>
  );
};

export default connector(EsignStatus);
