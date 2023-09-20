require("express-async-errors");
require("dotenv").config({ path: "./backend/config.env" });
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database/connect");
const { errorHandler } = require("./middleware/errorHandler");

// variable Initialize
const PORT = process.env.PORT || 5000;
const app = express();
const server = app.listen();

//middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's actual domain
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//Routes import
const userRouter = require("./routes/userRoute");
const bookRouter = require("./routes/bookRoute");
// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", bookRouter);
// Error Handler
app.use(errorHandler);

// func to connect to database and start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is listening on  http://localhost:${PORT}`);
  });
};

// Server start
start();

//testing purpose
app.get("/", (req, res) => {
  res.send("server Running ");
});
// Unhandled Error
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log("Shutting Down Server due to error.");
  server.close(() => {
    process.exit(1);
  });
});
