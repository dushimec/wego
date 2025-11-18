import { cloudinaryService } from "@/lib/cloudinary-service";

export async function uploadImageAndSaveToFirestore({ imageUrl, db, carData, ownerId }: {
  imageUrl: string;
  db: any;
  carData: any;
  ownerId: string;
}) {
  // Upload to Cloudinary
  const cloudinaryUrl = await cloudinaryService.uploadImage(imageUrl, "car-rentals");

  // Prepare Firestore document payload. Ensure the `images` array exists so UI components
  // that expect car.images[0] will still work. We include both the original file URL and
  // the Cloudinary public URL for future reference.
  const carDoc = {
    ...carData,
    ownerId,
    fileUrl: imageUrl,
    cloudinaryUrl,
    images: [cloudinaryUrl].concat(carData.images || []),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return carDoc;
}
