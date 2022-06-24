const path = require("path");

const express = require("express");
require("dotenv").config({ path: "./config.env" });
const cors = require("cors");
const {webHookCheckOut} = require('./controllers/userController')
const compression = require('compression')

const mountRoutes = require("./routes/index");
const globalError = require("./middleware/errorsMiddleware");
const dbConnection = require("./database/dbConnection");
const ApiError = require("./utils/apiError");

dbConnection();

const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

//Compress Response
app.use(compression())


//WebHook For subscription
app.post('/sub-webhook', express.raw({type: 'application/json'}),  webHookCheckOut)

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

mountRoutes(app);
app.use("*", (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 404));
});

//Global error handling middleware
app.use(globalError);

app.listen(process.env.PORT, () => {
  console.log(`Application listening on port: ${process.env.PORT}`);
});
