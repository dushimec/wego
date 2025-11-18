import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const cloudinaryService = {
  async uploadImage(base64OrUrl: string, folderPath = "car-rentals"): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(base64OrUrl, {
        folder: folderPath,
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      })
      return result.secure_url
    } catch (error) {
      console.error("[v0] Cloudinary upload error:", error)
      throw new Error("Failed to upload image to Cloudinary")
    }
  },

  async uploadMultipleImages(files: Buffer[], folderPath = "car-rentals"): Promise<string[]> {
    const uploadPromises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folderPath,
              resource_type: "auto",
              quality: "auto",
              fetch_format: "auto",
              max_file_size: 5242880, // 5MB limit
            },
            (error, result) => {
              if (error) {
                console.error("[v0] Upload stream error:", error)
                reject(error)
              } else {
                resolve(result?.secure_url || "")
              }
            },
          )
          uploadStream.end(file)
        }),
    )

    return Promise.all(uploadPromises)
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split("/")
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split(".")[0]

      if (publicId) {
        await cloudinary.uploader.destroy(`car-rentals/${publicId}`, {
          resource_type: "image",
        })
      }
    } catch (error) {
      console.error("[v0] Cloudinary delete error:", error)
    }
  },
}
