import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import RHP from 'react-html-parser';

import MaterialModalPopup from '../primitives/MaterialModalPopup';
import { getObjectClassNames } from '../utils/designUtils';
import CloseIcon from '../assets/CloseIcon';
import PlusGreyRounded from '../assets/PlusGreyRounded';
import { AccordionArr, AccordionItemType } from '../../pages_utils/cmr_cml';
import { mediaQueries } from '../utils/designSystem';

const classes: any = getObjectClassNames({
  OtherModal: {
    '.CloseBtn': {
      top: 28,
      right: 24,
    },
  },
  ModalHeader: {
    h3: {
      margin: 0,
    },
  },
  ModalBody: {
    padding: '32px 24px 0px 24px',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 150px)',
    margin: '0 -24px',
    '&::-webkit-scrollbar': {
      width: 4,
      display: 'block',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--gripWhiteLilac, #f7f7fc)',
    },
    [mediaQueries.phone]: {
      maxHeight: 'calc(100vh - 250px)',
    },
  },
  AccordionMain: {
    boxShadow: 'none !important',
    padding: '0 !important',
    borderRadius: '0 !important',
    marginBottom: '16px !important',
    '&::before': {
      display: 'none !important',
    },
    '&:not(:first-child)': {
      paddingTop: '16px !important',
      borderTop: '1px solid var(--gripMercuryThree, #e6e6e6)',
    },
  },
  AccordionTitle: {
    padding: '0 !important',
    alignItems: 'center',
    minHeight: 'auto',
    'MuiAccordionSummary-content': {
      margin: '0 !important',
      padding: '0 70px 0 0',
    },
  },
  AccordionTitleInner: {
    margin: 0,
  },
  FaqItemTitle: {
    fontWeight: 500,
    fontSize: 18,
    lineHeight: '28px',
    color: 'var(--gripLuminousDark)',
    margin: 0,
  },
  MainContent: {
    padding: '12px 0 0 0 !important',
    a: {
      textDecoration: 'underline',
      color: 'var(--gripBlue)',
    },
    ul: {
      listStyleType: 'disc',
      paddingLeft: '25px',
      paddingTop: 10,
      paddingBottom: 10,
    },
  },
});

type Props = {
  showModal?: boolean;
  className?: string;
  handleModalClose?: () => void;
  selectedId?: string;
};

const OtherBrokerModal = ({
  showModal = false,
  handleModalClose = () => {},
  className = '',
  selectedId = '',
}: Props) => {
  const selectedPanel =
    AccordionArr.findIndex((item) => item.id === selectedId) + 1;
  const [expanded, setExpanded] = React.useState<string | false>(`panel0`);
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  React.useEffect(() => {
    if (selectedId === '') {
      setExpanded(`panel0`);
    } else {
      setExpanded(selectedPanel === 0 ? 'panel1' : `panel${selectedPanel}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <MaterialModalPopup
      showModal={showModal}
      mainClass={className}
      className={classes.OtherModal}
      handleModalClose={handleModalClose}
      isModalDrawer={true}
    >
      <div className={classes.ModalHeader}>
        <h3 className="Heading5">Find your CMR/ CML</h3>
      </div>
      <div className={classes.ModalBody}>
        {AccordionArr.map((item: AccordionItemType, index: number) => {
          return (
            <Accordion
              classes={{
                root: classes.AccordionMain,
              }}
              disableGutters={true}
              variant="elevation"
              expanded={expanded === `panel${index + 1}`}
              onChange={handleChange(`panel${index + 1}`)}
              key={`title-${item?.title}`}
            >
              <AccordionSummary
                classes={{
                  root: classes.AccordionTitle,
                  content: classes.AccordionTitleInner,
                }}
                expandIcon={
                  expanded === `panel${index + 1}` ? (
                    <CloseIcon />
                  ) : (
                    <PlusGreyRounded />
                  )
                }
              >
                <h3 className={classes.FaqItemTitle}>{item.title}</h3>
              </AccordionSummary>
              <AccordionDetails
                classes={{
                  root: classes.MainContent,
                }}
              >
                <p className="TextStyle1">{RHP(item.content)}</p>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </MaterialModalPopup>
  );
};

export default OtherBrokerModal;
