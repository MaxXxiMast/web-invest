import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { setToast } from '../../redux/slices/toast';

import type { RootState } from '../../redux';
import type { SetToastType } from '../../redux/types/user';

type MyProps = {
  toastInfo: SetToastType;
  setToast: (data: SetToastType) => void;
};

function Toast(props: MyProps) {
  let toastId = React.useRef(null);

  useEffect(() => {
    toast.update(toastId.current, {
      type: props.toastInfo.type,
      render: props.toastInfo.msg,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.toastInfo.visible]);

  const openToast = () => {
    toastId.current = toast[props.toastInfo.type](props.toastInfo.msg);
    toast.clearWaitingQueue();
    props.setToast({
      visible: false,
      msg: '',
      type: props.toastInfo.type,
    });
    return <div />;
  };

  if (props.toastInfo && props.toastInfo.visible) {
    return openToast();
  }
  return null;
}

const mapStateToProps = (state: RootState) => ({
  toastInfo: state.toast.toastInfo,
});

const mapDispatchToProps = {
  setToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(Toast);
