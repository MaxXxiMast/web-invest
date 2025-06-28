import React, { ReactNode } from 'react';
import RHP from 'react-html-parser';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import styles from '../../styles/Referral/faqProductDetail.module.css';
import CloseIcon from '../../components/assets/CloseIcon';
import PlusGreyRounded from '../../components/assets/PlusGreyRounded';

type Props = {
  data?: any;
  faq?: any;
  containerClassName?: string;
  renderTitle?: () => ReactNode;
};

const FAQ = ({
  data,
  faq,
  containerClassName = '',

  renderTitle = null,
}: Props) => {
  const [expanded, setExpanded] = React.useState<string | false>('panel1');
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const renderDefaultTitle = (
    <div className={styles.TitleSection}>
      <div className="text-left">
        <h4 className="sectionSubtitle">To help you</h4>
        <h3 className="sectionTitle">
          Frequently Asked <span>Questions</span>
        </h3>
      </div>
    </div>
  );

  return (
    <div className={`${styles.FAQMain} slide-up`}>
      <div className={`containerNew ${containerClassName}`}>
        {renderTitle?.() ?? renderDefaultTitle}
        <div className={styles.FaqSection}>
          <div className={styles.FaqSectionLeft}>
            {data.map((item: any, index: number) => {
              return (
                index % 2 === 0 && (
                  <Accordion
                    disableGutters={true}
                    key={item?.id}
                    classes={{
                      root: styles.AccordionMain,
                    }}
                    variant="elevation"
                    expanded={expanded === `panel${index + 1}`}
                    onChange={handleChange(`panel${index + 1}`)}
                  >
                    <AccordionSummary
                      classes={{
                        root: styles.AccordionTitle,
                      }}
                      expandIcon={
                        expanded === `panel${index + 1}` ? (
                          <CloseIcon />
                        ) : (
                          <PlusGreyRounded />
                        )
                      }
                    >
                      <h3 className={styles.FaqItemTitle}>{item.question}</h3>
                    </AccordionSummary>
                    <AccordionDetails
                      classes={{
                        root: `${styles.MainContent} FaqMainContent`,
                      }}
                    >
                      {RHP(item.answer)}
                    </AccordionDetails>
                  </Accordion>
                )
              );
            })}
          </div>
          <div className={styles.FaqSectionRight}>
            {data.map((item: any, index: number) => {
              return (
                index % 2 !== 0 && (
                  <Accordion
                    key={item?.id}
                    disableGutters={true}
                    classes={{
                      root: styles.AccordionMain,
                    }}
                    variant="elevation"
                    expanded={expanded === `panel${index + 1}`}
                    onChange={handleChange(`panel${index + 1}`)}
                  >
                    <AccordionSummary
                      classes={{
                        root: styles.AccordionTitle,
                      }}
                      expandIcon={
                        expanded === `panel${index + 1}` ? (
                          <CloseIcon />
                        ) : (
                          <PlusGreyRounded />
                        )
                      }
                    >
                      <h3 className={styles.FaqItemTitle}>{item.question}</h3>
                    </AccordionSummary>
                    <AccordionDetails
                      classes={{
                        root: `${styles.MainContent} FaqMainContent`,
                      }}
                    >
                      {RHP(item.answer)}
                    </AccordionDetails>
                  </Accordion>
                )
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
