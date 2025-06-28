import React, { PropsWithChildren } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

type MyProps = {
  open: boolean;
};

export default function BackdropComponent(props: PropsWithChildren<MyProps>) {
  return (
    <Backdrop
      open={props.open}
      style={{ zIndex: 10000, height: '100%', position: 'fixed' }}
    >
      {props?.children ?? <CircularProgress />}
    </Backdrop>
  );
}
