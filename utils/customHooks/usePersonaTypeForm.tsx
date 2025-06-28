import { useContext, useEffect, useRef, useState } from 'react';
import { createWidget } from '@typeform/embed';
import { GlobalContext } from '../../pages/_app';
import { getEnv } from '../constants';

type PersonaTypeForm = {
  formContainerRef: React.MutableRefObject<HTMLDivElement>;
  height?: number;
  userID?: string;
  handleSubmitCB: (responseID: string) => void;
};

const usePersonaTypeForm = ({
  formContainerRef,
  height = 600,
  userID = '',
  handleSubmitCB,
}: PersonaTypeForm) => {
  const envName = getEnv() === 'production' ? 'UzcIT7hn' : 'bn03BikW';
  const { typeFormId }: any = useContext(GlobalContext);
  const typeformWidgetRef = useRef<any>(null);
  const [showModal, setShowModal] = useState(false);

  const closeTypeform = () => {
    setShowModal(false);
    typeformWidgetRef.current = null;
  };

  const openTypeform = () => {
    setShowModal(true);
  };

  const initializeTypeform = () => {
    if (!typeformWidgetRef?.current && formContainerRef?.current) {
      const options = {
        open: 'time',
        height: height,
        preventReopenOnClose: true,
        hideHeaders: true,
        hideFooter: false,
        keepSession: true,
        container: formContainerRef.current,
        autoFocus: true,
        inlineOnMobile: true,
        autoClose: true,
        medium: 'embed-sdk',
        hidden: {
          userID,
        },
        onSubmit: async (data) => {
          sessionStorage.setItem(
            'personaTypeFormResponseId',
            data?.response_id
          );
          closeTypeform();
          handleSubmitCB(data?.response_id);
        },
      };

      typeformWidgetRef.current = createWidget(typeFormId || envName, options);
    }
  };

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        initializeTypeform();
      }, 0);
    }
  }, [showModal]);

  return {
    closeTypeform,
    openTypeform,
    showModal,
  };
};

export default usePersonaTypeForm;
