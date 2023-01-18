// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const cloudinary = require("../../lib/cloudinary");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req, res) {
  const { images } = JSON.parse(req.body);
  const result = await Promise.all(
    images.map((image) =>
      cloudinary.uploader.upload(image, {
        folder: "general",
      })
    )
  );

  // const dataToCloudinary = images.map(image => cloudinary.uploader.upload())
  // cloudinary.uploader.upload()
  res.status(200).json({ result });
}
