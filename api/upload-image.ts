import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

// Disable body parsing, we'll use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let uploadedFilePath: string | null = null;

  try {
    // Parse the multipart form data
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Get the uploaded file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    uploadedFilePath = uploadedFile.filepath;

    // Get other form fields
    const rowId = Array.isArray(fields.rowId) ? fields.rowId[0] : fields.rowId;
    const row_number = Array.isArray(fields.row_number) ? fields.row_number[0] : fields.row_number;
    const oldImageUrl = Array.isArray(fields.oldImageUrl) ? fields.oldImageUrl[0] : fields.oldImageUrl;
    const fileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;

    console.log('Processing upload:', {
      fileName,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      rowId,
      row_number
    });

    // Create form data for n8n webhook using axios
    const formData = new FormData();
    formData.append('file', fs.createReadStream(uploadedFile.filepath), {
      filename: fileName || uploadedFile.originalFilename || 'image.jpg',
      contentType: uploadedFile.mimetype || 'image/jpeg',
    });
    formData.append('rowId', rowId || '');
    formData.append('row_number', row_number || '');
    formData.append('oldImageUrl', oldImageUrl || '');
    formData.append('fileName', fileName || uploadedFile.originalFilename || 'image.jpg');

    // Get n8n webhook URL from environment
    const webhookUrl = process.env.N8N_IMAGE_UPLOAD_WEBHOOK;

    if (!webhookUrl) {
      return res.status(500).json({ message: 'N8N webhook URL not configured' });
    }

    console.log('Forwarding to n8n webhook...');

    // Forward to n8n webhook using axios (better multipart support than fetch)
    const response = await axios.post(webhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    // Clean up temporary file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    console.log('Upload successful:', response.data);

    res.json(response.data);

  } catch (error) {
    console.error('Upload error:', error);

    // Clean up temporary file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: 'Failed to upload to n8n',
        error: error.response?.data || error.message
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
