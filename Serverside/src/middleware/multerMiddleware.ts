import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

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

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image'); 
