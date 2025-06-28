import React from 'react';
import Viewer, { Worker } from '@phuocng/react-pdf-viewer';
import { pdfjs } from 'react-pdf';
import { getObjectClassNames } from '../utils/designUtils';

import '@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css';
import { mediaQueries } from '../utils/designSystem';
const classes = getObjectClassNames({
  pdfDiv: {
    height: '600px',
    marginTop: 20,
    [mediaQueries.phone]: {
      height: 300,
    },
    '.viewer-toolbar-right': {
      [mediaQueries.phone]: {
        display: 'none',
      },
    },
  },
});

function PDFViewer(props) {
  const pdfWorkerUrl = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  return (
    <Worker workerUrl={pdfWorkerUrl}>
      <div className={props.customClass || classes.pdfDiv}>
        <Viewer fileUrl={props.url} defaultScale={'PageWidth'} />
      </div>
    </Worker>
  );
}

export default PDFViewer;
