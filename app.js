// Import necessary libraries
import express from "express";
import axios from "axios";
import path from "path";
import {dirname} from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import  mongoose from "mongoose";
import Movie from "./models/movieLinksModel.js";
import  ImagePath  from "./models/imagePathModel.js";
import Trailer from "./models/trailerLinksModel.js";
import Title from "./models/titleModel.js";

// Initialize Express app
const app = express();

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

// Mongoose 
mongoose.set("strictQuery", false)
mongoose.connect(String(process.env.DATABASE)).then((con) => {
  console.log("Database connected successfully!")
})

// Initializing __dirname const
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set the port from environment variables
const port = process.env.PORT || 3000;

// Set the apiKey from environment variables
const apiKey = process.env.APIKEY

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Configuration for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  }
});

// Arrays of movie to search for.
var movies;
let trailerLinks;
let imagesPath;
let videoLinks;

try {
 movies = await Title.find({}).exec();
 trailerLinks = await Trailer.find({}).exec();
 imagesPath = await ImagePath.find({}).exec();
 videoLinks = await Movie.find({}).exec();

} catch (e) {
  console.log(e.message)
}


// Arrays to store movie data.
const Titles = []
const writeUps = []
const runtimes = []

// Middleware to collect data from APIs. This middleware makes an api call for all the movies in the movies array and pushes retrieved data their neede locations(Titles, writeups, and runtimes arrays).
async function dataCollection(req, res, next) {
  try {
    const duration = async function (data) {
      // Calculate movie duration
      if ((data / 60) >= 4) return '4 hours+';
      if ((data / 60) >= 3) return '3 hours+';
      if ((data / 60) >= 2) return '2 hours+';
      if ((data / 60) >= 1) return '1 hour+';
      return data + " minutes";
    };

    for (let i = 0; i < movies.length; i++) {
      const movieData = await axios.get("https://api.themoviedb.org/3/search/movie?query=" + movies[i].title + "&api_key=" + apiKey);
      const movieDetails = await axios.get("https://api.themoviedb.org/3/movie/" + movieData.data.results[0].id + "?api_key=" + apiKey);

      Titles.push(movieDetails.data.original_title);
      writeUps.push(movieDetails.data.overview);
      runtimes.push(await duration(parseFloat(movieDetails.data.runtime)));
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
}

// Use dataCollection middleware
app.use(dataCollection);

// Routes

// Home page route
app.get("/", (req, res) => {
  if (Titles && writeUps && runtimes && imagesPath) {
    res.render("index", { cardTitle: Titles, writeUps: writeUps, runtimes: runtimes, imagesPath: imagesPath });
  } else {
    res.status(500).send("Internal Server Error");
  }
});

// Movie details page route
app.get("/movie", (req, res) => {
  res.render("movie");
});

// Post route for selected movie
app.post("/movie", (req, res) => {
  const { Title, Index, Story, ImgUrl, Duration } = req.body;
  res.render("movie", { Title, ImgUrl, Story, Duration, index: Index, VideoLinks: videoLinks, TrailerLinks: trailerLinks });
});

// Email Us page route
app.get("/emails", (req, res) => {
  res.render("email");
});

// Post route for sending emails
app.post("/emails", async (req, res) => {
  try {
    const data = {
      from: process.env.USER,
      to: process.env.RECIEVER,
      subject: "MovieMajestic!",
      text: `Sender's Name: ${req.body.Name},\nSender's Mail: ${req.body.Email},\nComments: ${req.body.Comments}`
    };

    await transporter.sendMail(data);
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
