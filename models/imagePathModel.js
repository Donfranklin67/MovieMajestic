import { model } from "mongoose";

const PathSchema = {
    path: String,
};

const ImagePath = model("ImagePath", PathSchema);

export default ImagePath;
