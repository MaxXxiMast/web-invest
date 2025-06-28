import React from 'react';
import RHP from 'react-html-parser';
import styles from '../../styles/AssetPortfolio.module.css';
import CSS from '../../styles/Referral/EarnMore.module.css';

type Props = {
  data: any;
  className?: any;
};
const EarnMore = ({ data, className }: Props) => {
  return (
    <div className="containerNew">
      <div
        className={`${styles.AssetPortfolioTop} slide-up ${className}  ${CSS.AssetPortfolioTop}`}
      >
        <div className={`flex ${CSS.AssetPortfolioTopLeft}`}>
          <div className={`${CSS.TitleBox}`}>
            <h3 className="sectionTitle">
              {(data?.heading && RHP(data?.heading)) || (
                <>
                  We have <span>More Rewards</span> for Grip Lovers{' '}
                </>
              )}
            </h3>
            <h4 className="sectionTagLine"> {data?.subHeading}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarnMore;
