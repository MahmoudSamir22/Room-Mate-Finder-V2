const path = require("path");

const express = require("express");
require("dotenv").config({ path: "./config.env" });
const cors = require("cors");

const mountRoutes = require("./routes/index");
const globalError = require("./middleware/errorsMiddleware");
const dbConnection = require("./database/dbConnection");
const ApiError = require("./utils/apiError");

dbConnection();

const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

mountRoutes(app);
app.post('/sub-webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE-WEBHOOK_SECRET;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }
  if(eventType.invoice.paid){
    console.log(`Paied successfully and now is sub`)
  }
})
app.use("*", (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 404));
});

//Global error handling middleware
app.use(globalError);

app.listen(process.env.PORT, () => {
  console.log(`Application listening on port: ${process.env.PORT}`);
});
