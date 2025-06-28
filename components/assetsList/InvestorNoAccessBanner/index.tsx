import React from 'react';
import dompurify from 'dompurify';
import Image from 'next/image';

import classes from './InvestorNoAccessBanner.module.css';

type MyProps = {
  message: string;
  header: string;
  url: string;
};

function InvestorNoAccessBanner(props: MyProps) {
  const sanitizer = dompurify.sanitize;
  return (
    <div className={`flex-column ${classes.mainContainer}`}>
      <Image 
        className={classes.icon} 
        src={props.url} 
        alt="icon"
        width={20}
        height={20}
      />
      <text className={classes.heading}>{props.header}</text>
      <text
        className={classes.subHeadingText}
        dangerouslySetInnerHTML={{
          __html: sanitizer(props.message),
        }}
      />
    </div>
  );
}

export default InvestorNoAccessBanner;
