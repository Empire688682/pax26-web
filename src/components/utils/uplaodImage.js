import axios from "axios";

const uploadImage = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "jayempire");

  try {
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, data);
    const { secure_url } = res.data;
    return secure_url;
  } catch (err) {
    console.log("uploadImage:",err)
  }
};

export default uploadImage;
