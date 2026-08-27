import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';
import { GuestJwtGuard } from '../../common/guards/guest-jwt.guard';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

/**
 * Two storage backends, picked by STORAGE_DRIVER:
 * - "local" (default, used in local dev): files land in ./uploads, served statically at
 *   /uploads/<filename> (see main.ts). Disk isn't persistent on Vercel, so this is dev-only.
 * - "vercel-blob" (used in production on Vercel): files go to Vercel Blob storage and the
 *   response `url` is the Blob's public CDN URL directly — no local static serving involved.
 */
const IS_BLOB = process.env.STORAGE_DRIVER === 'vercel-blob';

const storage = IS_BLOB
  ? memoryStorage()
  : diskStorage({
      destination: join(__dirname, '..', '..', '..', 'uploads'),
      filename: (_req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
    });

const IMAGE_TYPES = /\.(jpg|jpeg|png|webp|gif)$/i;

function fileFilter(_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) {
  if (!IMAGE_TYPES.test(extname(file.originalname))) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
}

async function toResponse(file: Express.Multer.File) {
  if (!IS_BLOB) return { url: `/uploads/${file.filename}` };
  const blob = await put(`uploads/${uuid()}${extname(file.originalname)}`, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
  });
  return { url: blob.url };
}

@Controller('upload')
export class UploadController {
  @Post('admin')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } }))
  uploadAsAdmin(@UploadedFile() file: Express.Multer.File) {
    return toResponse(file);
  }

  @Post('guest')
  @UseGuards(GuestJwtGuard)
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } }))
  uploadAsGuest(@UploadedFile() file: Express.Multer.File) {
    return toResponse(file);
  }
}
