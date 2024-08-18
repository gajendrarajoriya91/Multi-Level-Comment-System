const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/dbConfig");

const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
connectDB();

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/posts", commentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
