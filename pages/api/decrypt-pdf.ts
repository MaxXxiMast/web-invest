// pages/api/decryptpdf.ts

import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import qpdf from 'node-qpdf';
import fs from 'fs';

interface CustomNextApiRequest extends NextApiRequest {
  file?: any;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const tmp = multer({ dest: 'tmp/' });

export default async function handler(
  req: CustomNextApiRequest,
  res: NextApiResponse
) {
  try {
    // Use multer to handle file upload
    await tmp.single('pdf')(req, res, async function (err) {
      if (err) {
        res.status(500).json({ error: 'Error uploading file' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const uploadedFile = req.file;
      const { password } = req.body;

      // Decrypt the uploaded PDF using node-qpdf
      const doc = await qpdf.decrypt(
        uploadedFile.path,
        password,
        (err: any, success: any) => {
          if (err) {
            res.status(500).json({ msg: 'Error decrypting the PDF' });
          }
          if (!err && success) {
            // Ensure that you remove the temporary uploaded file
            fs.unlinkSync(uploadedFile.path);
          }
        }
      );

      // Set the response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=decrypted.pdf'
      );

      // Send the decrypted PDF as a response
      res.status(200).send(doc);
    });
  } catch (error) {
    console.error('Error handling the request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
