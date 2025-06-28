// NODE MODULES
import { type PropsWithChildren, useEffect } from 'react';
import Cookie from 'js-cookie';
import queryString from 'query-string';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';

// Components
import DigioModal from '../common/DigioModal';

import { setMcaEsignLoading } from '../../redux/slices/orders';
import { setOpenCommentBox } from '../../redux/slices/rfq';

// Hooks
import { useAppSelector } from '../../redux/slices/hooks';

// Utils
import { isUserLogged } from '../../utils/user';
import { isUtmParamExist, popuplateUTMParams } from '../../utils/utm';

const PaymentModal = dynamic(() => import('../rfq/PaymentModal'), {
  ssr: false,
});

const CommentBox = dynamic(() => import('../CommentBox/CommentBoxPopup'), {
  ssr: false,
});

const Main = ({ children }: PropsWithChildren<{}>) => {
  const dispatch = useDispatch();

  const isPaymentModalOpen = useAppSelector(
    (state) => state.config.isPaymentModalOpen
  );
  const isCommentBoxOpen = useAppSelector(
    (state) => state.rfq.isCommentBoxOpen
  );

  useEffect(() => {
    if (
      window?.top &&
      window?.self &&
      window.top?.location?.href !== window.self?.location?.href
    ) {
      window.top.location.href = window.self.location?.href;
    }

    dispatch(setMcaEsignLoading(false));
    const queryParams: any = queryString.parse(window.location.search);

    if (isUtmParamExist(queryParams)) {
      const utmParams = popuplateUTMParams(queryParams);
      Cookie.set(
        'utm',
        JSON.stringify({
          search: window.location.search,
          ...utmParams,
        }),
        {
          expires: 7,
        }
      );
    }
    if (Object.keys(queryParams).length > 0) {
      if (
        Object.prototype.hasOwnProperty.call(queryParams, 'reporting') &&
        !Cookie.get('refId')
      ) {
        Cookie.set('refId', queryParams.reporting, { expires: 7 });
      }
      if (
        Object.prototype.hasOwnProperty.call(queryParams, 'referralCode') &&
        !Cookie.get('refCode')
      ) {
        Cookie.set('refCode', queryParams.referralCode, { expires: 7 });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Close comment box on page refresh
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        dispatch(setOpenCommentBox(false));
      });
      window.addEventListener('popstate', () => {
        dispatch(setOpenCommentBox(false));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContent = () => {
    return (
      <>
        {children}
        {isPaymentModalOpen && isUserLogged() ? <PaymentModal /> : null}
      </>
    );
  };

  return (
    <>
      {handleContent()}
      <DigioModal />
      {isCommentBoxOpen ? <CommentBox /> : null}
    </>
  );
};

export default Main;
