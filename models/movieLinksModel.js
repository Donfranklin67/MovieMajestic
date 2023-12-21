import { model } from "mongoose";

const MovieSchema = {
    link: String,
};

const Movie = model("Movie", MovieSchema);

export default Movie;
