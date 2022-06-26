const path = require("path");

const express = require("express");
require("dotenv").config({ path: "./config.env" });
const cors = require("cors");
const {webHookCheckOut} = require('./controllers/userController')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp');
const rateLimit = require('express-rate-limit')

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


// Data cleaning and sanitization
app.use(mongoSanitize());
app.use(xss())


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, 
  message: 'Too many accounts created from this IP, please try again after an hour'
})

// Apply the rate limiting middleware to all requests
app.use('/api', limiter)


//Middleware to protect against HTTP paramter pollution attacks
app.use(hpp({whitelist: ['roomPrice']}));

mountRoutes(app);
app.use("*", (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 404));
});

//Global error handling middleware
app.use(globalError);

app.listen(process.env.PORT, () => {
  console.log(`Application listening on port: ${process.env.PORT}`);
});
