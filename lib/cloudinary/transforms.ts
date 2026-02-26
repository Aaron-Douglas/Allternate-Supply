const BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export type ImageSize = 'thumb' | 'card' | 'detail' | 'zoom';

const TRANSFORMS: Record<ImageSize, string> = {
  thumb: 'w_120,h_90,c_fill,f_auto,q_auto',
  card: 'w_480,h_360,c_fill,f_auto,q_auto',
  detail: 'w_800,h_600,c_limit,f_auto,q_auto',
  zoom: 'w_1600,h_1200,c_limit,f_auto,q_90',
};

export function cloudinaryUrl(publicId: string, size: ImageSize): string {
  return `${BASE}/${TRANSFORMS[size]}/${publicId}`;
}
