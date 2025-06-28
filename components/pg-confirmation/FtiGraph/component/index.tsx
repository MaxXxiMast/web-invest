// NODE MODULES
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

// Utils
import { useMediaQuery } from '../../../../utils/customHooks/useMediaQuery';
import { getGraphArr } from '../utils';
import { GRIP_INVEST_BUCKET_URL } from '../../../../utils/string';
import { generateAssetURL } from '../../../../utils/asset';
import { fetchHighestIrrAssetSuggestion } from '../../../../api/order';
import { fetchAPI } from '../../../../api/strapi';

// Primtives
import Button, { ButtonType } from '../../../primitives/Button';
import Image from '../../../primitives/Image';

// Components
import {
  bondGraphApi,
  PendingPgOrderContext,
} from '../../../../pages/pg-confirmation';
import CustomSkeleton from '../../../primitives/CustomSkeleton/CustomSkeleton';

//styles
import classes from './FtiGraph.module.css';

const FtiGraphConfirmation: React.FC = () => {
  const isMobile = useMediaQuery();
  const router = useRouter();
  const data = useContext(PendingPgOrderContext);
  const [highestBondDetails, setHighestBondDetails] = useState<bondGraphApi>();
  const [confirmationPageData, setConfirmationPageData] = useState<unknown>();

  const { preTaxYtm, irr, assetImage, isGC, redirectToGC } = data;

  const bondIrr = highestBondDetails?.irr;
  const bondPartnerLogo = highestBondDetails?.partnerLogo;
  const bondRating = highestBondDetails?.rating;

  const FtiGraphObj = useMemo(
    () =>
      ((confirmationPageData as any[]) ?? []).filter(
        (ele) => ele?.keyValue === 'RegularBankFixedDeposit'
      )[0]?.objectData || {},
    [confirmationPageData]
  );

  const fetchAllData = async () => {
    const [highestBondDetails, confirmationPageData] = await Promise.all([
      fetchHighestIrrAssetSuggestion(),
      fetchAPI(
        '/inner-pages-data',
        {
          filters: {
            url: '/order-confirmation',
          },
          populate: {
            pageData: {
              populate: {
                seo: {
                  populate: true,
                },
                testimonials: {
                  populate: ['profileImage'],
                },
                images: {
                  populate: ['desktopUrl'],
                },
                slideImage: {
                  populate: ['desktopURL'],
                },
              },
            },
          },
        },
        {},
        false
      ),
    ]);
    setHighestBondDetails({
      ...(highestBondDetails ?? {}),
    });
    setConfirmationPageData(
      confirmationPageData?.data?.[0]?.attributes?.pageData
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const exploreToBondAssetDetails = () => {
    const url = generateAssetURL({
      assetID: highestBondDetails?.id,
      name: highestBondDetails?.name,
      category: highestBondDetails?.category,
      partnerName: highestBondDetails?.partnerName,
    });
    isGC ? redirectToGC() : router.push(url);
  };

  const RenderBtn = () => {
    return (
      <Button
        onClick={exploreToBondAssetDetails}
        data-automation="investment-explore-sdi-button"
        className={classes.Btn}
        width={isMobile ? '100%' : 150}
      >
        Explore Bonds
      </Button>
    );
  };

  const RenderEvelateText = () => {
    return (
      <h3
        data-automation="investment-evelate-heading"
        className={classes.EvelateHeading}
      >
        Elevate Your Investment Strategy
      </h3>
    );
  };

  const RenderHighReturnText = () => {
    return (
      <div className={`flex ${classes.HighReturnContainer}`}>
        <h3
          data-automation="investment-high-return-heading"
          className={classes.HighReturnHeading}
        >
          Earn higher returns
        </h3>
        {isMobile ? null : (
          <Image
            src={`${GRIP_INVEST_BUCKET_URL}icons/RotateArrow.svg`}
            alt="InfoIcon"
            width={80}
            height={80}
            layout={'fixed'}
          />
        )}
      </div>
    );
  };

  const RenderTextBtnContent = () => {
    return (
      <div
        className={`flex-column ${classes.RightContent}`}
        data-automation="investment-right-content"
      >
        <RenderEvelateText />
        <RenderHighReturnText />
      </div>
    );
  };

  const RenderGraph = () => {
    return (
      <div className={classes.graphWrapper} data-automation="graph-wrapper">
        <div className={classes.graphContainer}>
          <div
            className={`flex width100  ${classes.graph}`}
            data-automation="graph-graph"
          >
            {getGraphArr({
              preTaxYtm,
              irr,
              assetImage,
              FtiGraphObj,
              bondPartnerLogo,
              bondIrr,
              bondRating,
            })?.map((ele, index) => {
              const styles: React.CSSProperties = {
                background: ele.bgColor,
                color: ele.color,
              };

              const valueStyle: React.CSSProperties = {
                fontSize: `${ele?.valueSize}px`,
                color: ele?.valueColor,
              };

              const lableStyle: React.CSSProperties = {
                fontSize: `${ele?.lableSize}px`,
                fontWeight: ele?.labelFontWieight,
              };

              if (isMobile) {
                styles.width = `calc(${Number(ele.value)}% + ${
                  Number(ele.value) * 16
                }px)`;
                styles.maxWidth = '230px';
              } else {
                styles.height = `calc(${Number(ele.value)}% + ${
                  Number(ele.value) * 14
                }px)`;
              }

              if (!ele.value) {
                return null;
              }

              return (
                <div
                  key={ele.name}
                  className={`flex ${classes.barContainer} `}
                  data-automation={`investment-bar-container${ele.id}`}
                >
                  <div
                    data-automation={`investment-bar-${ele.id}`}
                    className={`flex-column ${classes.bar} ${
                      index === 2 ? classes.RowReverse : ''
                    }`}
                    style={{
                      ...styles,
                    }}
                  >
                    {ele?.assetImage ? (
                      <Image
                        src={ele?.assetImage}
                        alt="InfoIcon"
                        width={isMobile ? 60 : 100}
                        height={40}
                        layout={'fixed'}
                      />
                    ) : null}

                    <span
                      style={{ ...lableStyle }}
                      className={classes.barLabel}
                    >
                      {ele?.name}
                    </span>
                    {ele?.showBtn ? (
                      <Button
                        onClick={exploreToBondAssetDetails}
                        data-automation="investment-explore-button"
                        variant={ButtonType.Secondary}
                        className={classes.ExploreBtn}
                        compact
                        width={100}
                      >
                        Explore
                      </Button>
                    ) : null}
                  </div>
                  <span style={{ ...valueStyle }} className={classes.barName}>
                    {`${ele?.value}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const RenderGraphWrapper = () => {
    return (
      <div
        className={`flex justify-between items-center ${classes.Wrapper}`}
        data-automation="investment-wrapper"
      >
        <div
          className={`flex-column ${classes.LeftContent}`}
          data-automation="investment-left-content"
        >
          <div
            data-automation="investment-header-container"
            className={classes.HeadingContainer}
          ></div>
          <RenderGraph />
          <div
            data-automation="investment-btn-container"
            className={classes.BtnContainer}
          >
            <RenderBtn />
          </div>
        </div>
      </div>
    );
  };

  if (!highestBondDetails) {
    return (
      <CustomSkeleton
        styles={{
          width: '100%',
          height: 400,
        }}
      />
    );
  }

  return (
    <div
      className={`flex-column width100 ${classes.container}`}
      data-automation="Fti-container"
    >
      <RenderTextBtnContent />
      <RenderGraphWrapper />
    </div>
  );
};

export default FtiGraphConfirmation;
