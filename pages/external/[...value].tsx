import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';

//Utils
import { getObjectClassNames } from '../../components/utils/designUtils';
import { mediaQueries } from '../../components/utils/designSystem';
import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

//Redux
import { getRedirectInformation } from '../../redux/slices/redirect';
import { fetchUserInfo } from '../../redux/slices/user';
import { useAppDispatch } from '../../redux/slices/hooks';

const classes: any = getObjectClassNames({
  container: {
    position: 'relative',
    height: 'calc(100vh - 74px)',
    [mediaQueries.phone]: {
      height: 'calc(100vh - 30px)',
    },
  },
  loginContainer: {
    width: '100%',
    [mediaQueries.nonPhone]: {
      height: '100%',
    },
    [mediaQueries.phone]: {
      height: 'calc(100vh - 30px)',
    },
  },
  paymentImage: {
    width: '400px',
    [mediaQueries.phone]: {
      width: '70vw',
    },
  },
  processingHeader: {
    lineHeight: 1.09,
    fontSize: 22,
    color: '#00357c',
    marginTop: 20,
    fontWeight: 700,
  },
  processingText: {
    lineHeight: 2,
    fontSize: 12,
    color: '#000',
    fontWeight: 600,
  },
});

function Redirect(props: any) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { value } = router.query;
    getRedirectionUrl(value[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const getRedirectionUrl = (id: string) => {
    dispatch(
      getRedirectInformation(id, (data: any) => {
        if (data && data.redirectUrl) {
          dispatch(
            fetchUserInfo(
              data.user.userID,
              () => {
                Cookie.set('gc_callback_url', data?.gcCallbackUrl);
                // REDIRECT USER TO ASSET DETAILS PAGE IF REDIRECT URL CONTAINS ASSETDETAILS
                if ((data.redirectUrl as string).includes('assetdetails')) {
                  window.open(data.redirectUrl, '_self');
                } else {
                  window.open('/assets', '_self');
                }
              },
              false
            )
          );
        }
      })
    );
  };

  return (
    <div className={classes.container}>
      <div className={`flex_wrapper flex-column ${classes.loginContainer}`}>
        {/* Added img tag because of responsive behaviour of image in NextJS Image Component */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={classes.paymentImage}
          src={`${GRIP_INVEST_BUCKET_URL}homepage/paymentProcessing.png`}
          alt="Payment Processing"
        />
        <span className={classes.processingHeader}>
          Your redirect is in progress
        </span>
        <span className={classes.processingText}>
          Please do not hit back or refresh button…
        </span>
      </div>
    </div>
  );
}

export default Redirect;
