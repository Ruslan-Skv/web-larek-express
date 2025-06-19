import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { filename, originalname } = req.file;

    res.status(201).json({
      fileName: `/images/temp/${filename}`,
      originalName: originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};