import express from "express";
import {messagingServiceE2E} from "../index"

const devApp = express();

devApp.get("/", messagingServiceE2E);

const server = devApp.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`Messaging Service E2E listening on port ${port}`);
});
