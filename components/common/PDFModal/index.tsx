import React, { useEffect, useRef, useState } from 'react';
import PubSub from 'pubsub-js';
import { pdfjs, Document as ReactPDF, Page } from 'react-pdf';

import Dialog from '@mui/material/Dialog';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import classes from './PDFModal.module.css';

const PDFModal = () => {
  const [pdfURL, setPdfURL] = useState('');
  const [selectedPage, setSelectedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pdfSubs = useRef<any>(null);
  const isMobile = useMediaQuery();

  useEffect(() => {
    pdfSubs.current = PubSub.subscribe(
      'openFile',
      (topic: string, obj: any) => {
        const fileURL = obj.url;
        if (obj.fullPath.endsWith('.pdf')) {
          setPdfURL(fileURL);
        } else {
          window.open(fileURL, '_blank');
        }
      }
    );

    return () => {
      if (pdfSubs.current) {
        PubSub.unsubscribe(pdfSubs.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedPage !== 1) {
      setTimeout(() => {
        scrollToTop();
      }, 0);
    }
  }, [selectedPage]);

  const onDocumentLoadSuccess = (document: any) => {
    setTotalPages(document.numPages);
    setSelectedPage(1);
  };

  const movePageBackward = () => {
    if (selectedPage !== 1) {
      setSelectedPage(selectedPage - 1);
    }
  };

  const movePageForward = () => {
    if (selectedPage !== totalPages) {
      setSelectedPage(selectedPage + 1);
    }
  };

  const onCloseDocument = () => {
    setPdfURL('');
    setSelectedPage(1);
    setTotalPages(1);
  };

  const scrollToTop = () => {
    const container: any = document.getElementById('top-div');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPDFDialog = () => {
    return (
      <Dialog
        open={Boolean(pdfURL)}
        onClose={onCloseDocument}
        classes={{
          root: classes.dialogRoot,
          paper: classes.dialogPaper,
        }}
      >
        <React.Fragment>
          <div>
            <span className={`icon-cross ${classes.closeIcon}`}  onClick={onCloseDocument}/>
          </div>
          <div id={'top-div'}></div>
          <ReactPDF
            file={pdfURL}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(e) => console.log(e)}
          >
            <Page pageNumber={selectedPage} width={isMobile ? 350 : 800} />
          </ReactPDF>
          <div className={classes.pageControls}>
            <button onClick={movePageBackward}>‹</button>
            <span>
              {selectedPage} of {totalPages}
            </span>
            <button onClick={movePageForward}>›</button>
          </div>
        </React.Fragment>
      </Dialog>
    );
  };

  return renderPDFDialog();
};

export default PDFModal;
