import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadItemPhoto(
  file: Buffer,
  itemId: string,
  position: number
): Promise<{ publicId: string; secureUrl: string }> {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder: `inventory/${itemId}`,
      public_id: `photo_${position}`,
      overwrite: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }
  );
  return { publicId: result.public_id, secureUrl: result.secure_url };
}

export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
