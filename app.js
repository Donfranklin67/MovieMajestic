// Import necessary libraries
import express from "express";
import axios from "axios";
import path from "path";
import {dirname} from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Initialize Express app
const app = express();

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

// Initializing __dirname const
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set the port from environment variables
const port = process.env.PORT;

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

// Array of movie names to search for.
const movies = ["The Encounter", "I Believe", "God's not Dead", "Heaven Is for Real", "Breakthrough", "Courageous", "The Passion of Christ", "I Can Only Imagine", "break every chain"];

// Stores the trailer links for the trailer button in movie.ejs file.
const trailerLinks = ["https://www.youtube.com/watch?v=iMDaERXJfCk", "https://www.youtube.com/watch?v=amVlQozDJkI", "https://www.youtube.com/watch?v=j2KDj7qxnds", "https://www.youtube.com/watch?v=mydh4MEo2B0", "https://www.youtube.com/watch?v=go1jaIRQc-o", "https://www.youtube.com/watch?v=70MVn1q-yyM", "https://www.youtube.com/watch?v=4Aif1qEB_JU", "https://www.youtube.com/watch?v=OsMyv9Q4_OU", "https://www.youtube.com/watch?v=EtRdHtIS-WM"]

// Stores the images path.
const imagesPath = ["/images/The_Encounter_Image1.jpg", "/images/I_Believe.jpg", "/images/God_is_not_Dead.jpg", "/images/Heaven_Is_for_Real.jpg", "/images/Break_Through.jpeg", "/images/Courageous.jpg",
  "/images/The_Passion_of_christ.jpg", "/images/I_can_only_imagine.jpg", "/images/Break_Every_Chain.jpg"]

// Stores the full movie links for the watch button in movie.ejs file.
const videoLinks = ["https://www.youtube.com/watch?v=bj-PekUGBnA", "https://www.youtube.com/watch?v=1USWVZjTRw8", "https://www.youtube.com/watch?v=01oZRcMAX4Q", "https://www.youtube.com/watch?v=2dqXLuYPizs&t=23s", "https://archive.org/details/breakthrough-movie-2019", "https://www.youtube.com/watch?v=1mIBHNysDIo&t=6s", "https://www.youtube.com/watch?v=W9UcImEiF9o", "https://www.youtube.com/watch?v=bsbIHXMuae8", "https://www.youtube.com/watch?v=-Mp7hjgjY70&t=11s"]


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
      const movieData = await axios.get("https://api.themoviedb.org/3/search/movie?query=" + movies[i] + "&api_key=" + apiKey);
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
  res.render("index", { cardTitle: Titles, writeUps: writeUps, runtimes: runtimes, imagesPath: imagesPath });
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
