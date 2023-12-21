import { model } from "mongoose";

const TitleSchema = {
    title: String,
};

const Title = model("Title", TitleSchema);

export default Title;
