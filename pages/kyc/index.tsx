import { useContext, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Cookie from 'js-cookie';
import { RootState } from '../../redux';
import {
  fetchUserInfo,
  getBankInfo,
  getKYCConsent,
  getPanAadhaarDetails,
  getUserKycDocuments,
} from '../../redux/slices/user';
import { useRouter } from 'next/router';
import { getKycUrl, isUserAccredited } from '../../utils/user';
import { NextPage } from 'next';
import BackdropComponent from '../../components/common/BackdropComponent';
import { isOBPPKYCEnabledForAsset } from '../../utils/rfq';

// Contexts
import { GlobalContext } from '../_app';

const mapStateToProps = (state: RootState) => ({
  userData: state.user.userData,
  kycDetails: state.user.kycDetails,
  kycConsent: state.user.kycConsent,
  selectedAsset: state.access?.selectedAsset,
  access: state.access,
});
const mapDispatchToProps = {
  getPanAadhaarDetails,
  getUserKycDocuments,
  getBankInfo,
  fetchUserInfo,
  getKYCConsent,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface KYCProps extends PropsFromRedux {}

const KYC: NextPage = (props: KYCProps) => {
  let router = useRouter();
  const { obppSPVCategoryID = [] }: any = useContext(GlobalContext);

  useEffect(() => {
    const { source } = router.query;
    if (source) {
      Cookie.set('kycSource', 'discovery');
    }
    props.getUserKycDocuments(props.access.userID, () => {}, true);
    props.getPanAadhaarDetails();
    props.getBankInfo();
    props.fetchUserInfo(props.access?.userID);
    props.getKYCConsent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { userData, kycConsent, kycDetails } = props;
    const redirectTo = Cookie.get('redirectTo');
    const kycUrl = getKycUrl(
      {
        ...userData,
        isUserAccredited: isUserAccredited(kycConsent),
      },
      kycDetails,
      props.selectedAsset
    );
    if (props?.userData?.userID) {
      if (redirectTo === '/my-transactions') {
        Cookie.remove('redirectTo');
        router.push(kycUrl);
      } else {
        if (isOBPPKYCEnabledForAsset(props?.selectedAsset, obppSPVCategoryID)) {
          router.push('user-kyc');
        } else {
          router.push(kycUrl);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userData]);

  return <BackdropComponent open={true} />;
};

export default connector(KYC);
