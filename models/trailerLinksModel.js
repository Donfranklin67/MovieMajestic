import { model } from "mongoose";

const TrailerSchema = {
    trailer: String,
};

const Trailer = model("Trailer", TrailerSchema);

export default Trailer;
