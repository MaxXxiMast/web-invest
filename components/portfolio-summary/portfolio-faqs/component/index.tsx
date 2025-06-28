// NODE MODULES
import { useEffect, useState } from 'react';

//Components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

//Hooks
import { useSelector } from 'react-redux';

//Type
import { FAQType } from '../../context';

//API
import { fetchAPI } from '../../../../api/strapi';

// Utils
import { handleExtraProps } from '../../../../utils/string';
import { getLabelForProductType } from '../../utils';

// Styles
import styles from './PortfolioFAQ.module.css';

type FAQDataType = Partial<{
  id: number;
  question: string;
  answer: string;
}>;

type FAQListProps = {
  className?: string;
};

export default function FAQList(props: FAQListProps) {
  const [selectedKey, setSelectedKey] = useState<any>('');
  const [selectedFaqID, setSelectedFaqID] = useState<any>(0);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const getFaqs = async () => {
      const commonFAQs = await fetchAPI(
        '/common-faqs',
        {
          populate: '*',
        },
        {},
        false
      );
      const faqs: FAQType[] = commonFAQs?.data?.map(
        (faq: any) => faq?.attributes
      );
      setFaqs(faqs);
    };
    getFaqs();
  }, []);

  const {
    selectedAssetType = 'Bonds, SDIs & Baskets',
  }: { selectedAssetType: string } = useSelector(
    (state: any) => state?.portfolioSummary
  ) as any;

  const isLLPsSelected = selectedAssetType === 'LLPs & CRE';
  const isStartupSelected = selectedAssetType === 'Startup Equity';
  let finalFAQs: any = [];

  if (isLLPsSelected) {
    finalFAQs = (faqs || []).filter(
      (faq) => faq?.isLLP || faq?.isCommercialRealEstate
    );
  } else if (isStartupSelected) {
    finalFAQs = (faqs || []).filter((faq) => faq?.isStartupEquity);
  } else {
    finalFAQs = (faqs || []).filter((faq) => faq?.isBonds || faq?.isSDI);
  }
  const title = `FAQs about ${getLabelForProductType(selectedAssetType)}`;

  const openAccordion = (faq: FAQDataType) => () => {
    const { id, question } = faq || {};

    if (id === selectedFaqID && question === selectedKey) {
      setSelectedFaqID(0);
      setSelectedKey('');
    } else {
      setSelectedFaqID(id);
      setSelectedKey(question);
    }
  };
  const renderAccordion = (faq: FAQDataType, isLastFaq = false) => {
    const isSelected =
      selectedKey === faq?.question && faq.id === selectedFaqID;

    return (
      <Accordion
        className={`${styles.faqWrapper} ${
          !isLastFaq ? styles.borderLastBottom : ''
        }`}
        expanded={isSelected}
        key={`${faq?.id}`}
      >
        <AccordionSummary
          classes={{
            root: styles.accordionSummaryRoot,
            content: styles.accordionSummaryContent,
            expanded: styles.accordianExpanded,
          }}
          onClick={openAccordion(faq)}
          id={`${faq.id}`}
          expandIcon={
            <span
              className={`icon-caret-down-circle ${styles.PortfolioFAQIcon}`}
            />
          }
        >
          <div className={styles.faqQuestion}>{faq.question}</div>
        </AccordionSummary>
        <AccordionDetails
          classes={{
            root: styles.accordianDetails,
          }}
        >
          <div
            className={styles.faqAnswer}
            dangerouslySetInnerHTML={{ __html: faq?.answer }}
            onClick={openAccordion(faq)}
          />
        </AccordionDetails>
      </Accordion>
    );
  };

  if (!finalFAQs.length) {
    return null;
  }

  return (
    <div className={handleExtraProps(props?.className)}>
      <div className={styles.FAQHeading}>{title}</div>
      <div className={`${styles.questionsContainer}`}>
        {finalFAQs?.map((faq, idx) =>
          renderAccordion(faq, idx === finalFAQs?.length - 1)
        )}
      </div>
    </div>
  );
}
