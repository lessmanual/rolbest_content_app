import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm, File } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

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

    // Get other form fields
    const rowId = Array.isArray(fields.rowId) ? fields.rowId[0] : fields.rowId;
    const row_number = Array.isArray(fields.row_number) ? fields.row_number[0] : fields.row_number;
    const oldImageUrl = Array.isArray(fields.oldImageUrl) ? fields.oldImageUrl[0] : fields.oldImageUrl;
    const fileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;

    // Create form data for n8n webhook
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

    // Forward to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    // Clean up temporary file
    fs.unlinkSync(uploadedFile.filepath);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', errorText);
      return res.status(response.status).json({
        message: 'Failed to upload to n8n',
        error: errorText
      });
    }

    const result = await response.json();
    res.json(result);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
