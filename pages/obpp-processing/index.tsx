import { useEffect } from 'react';
import qs from 'qs';
import { ConnectedProps, connect, useDispatch } from 'react-redux';

import RedirectionPaymentPopup from '../../components/common/RedirectionPaymentPopup';
import { setSelectedRfq } from '../../redux/slices/rfq';
import { ORDER_NETBANKING_REDIRECT } from '../../utils/rfq';

const mapDispatchToProps = {
  setSelectedRfq,
};

const mapStateToProps = () => ({});

const connector = connect(mapStateToProps, mapDispatchToProps);

interface OBPPProcessingProps extends ConnectedProps<typeof connector> {
  orderData: any;
}

function OBPPProcessing(props: OBPPProcessingProps) {
  const dispatch = useDispatch();
  const orderData = JSON.parse(props?.orderData?.brokerPayData);
  const CONFIRMATION_PAGE = `/confirmation`;

  useEffect(() => {
    dispatch(
      setSelectedRfq({
        paymentRefID: orderData?.fundPayinRefId,
      })
    );

    setTimeout(() => {
      window.open(CONFIRMATION_PAGE, '_self');
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RedirectionPaymentPopup
      mainHeadingText={ORDER_NETBANKING_REDIRECT.mainHeading}
      redirectURL={CONFIRMATION_PAGE}
    />
  );
}

export async function getServerSideProps(context: any) {
  const { req } = context;

  const streamPromise = new Promise((resolve, reject) => {
    let postBody = '';

    req.on('data', (data: any) => {
      // convert Buffer to string
      postBody += data.toString();
    });

    req.on('end', () => {
      const postData = qs.parse(postBody);
      resolve(postData);
    });
  });

  let orderData = {};
  await streamPromise
    .then((res) => {
      orderData = res;
    })
    .catch((err) => {
      orderData = err;
    });

  return {
    props: {
      orderData: orderData,
    },
  };
}

export default connector(OBPPProcessing);
