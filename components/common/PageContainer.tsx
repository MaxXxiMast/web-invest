import React from 'react';

type Props = {
  children: any;
  containerStyle?: any;
};

const PageContainer = ({ children, containerStyle }: Props) => {
  return <div className={`pageContainer ${containerStyle}`}>{children}</div>;
};

export default PageContainer;
