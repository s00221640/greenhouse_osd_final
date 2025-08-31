import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'plants',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});

// Wrap multer.fields as a proper middleware for Express
const multerMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
}).fields([{ name: 'image', maxCount: 1 }]);

export const upload = (req: Request, res: Response, next: NextFunction) => {
  multerMiddleware(req, res, (err: any) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ message: 'File upload error', error: err });
    }
    next();
  });
};
