import express from "express";
import {messagingServiceE2E} from "../index";
import {sendNotice, targetEmail} from "../src/emailer.js";

const devApp = express();

devApp.get("/", messagingServiceE2E);

devApp.get("/emailtest", (req, resp)=>{
  console.log(`check ${targetEmail}`);
  sendNotice("test-subject", "test text / body");
  resp.status(200).send();
});

const server = devApp.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`listening on port ${port}`);
  console.log("try / or /emailtest");
});
