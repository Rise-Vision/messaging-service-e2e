import MessagingServiceClient from "./messaging-service-client";
import verifyToken from "./token/verify-token";
import {sendNotice} from "./emailer.js";
const timeout = 10000;
const logPath = "https://console.cloud.google.com/logs/viewer?project=messaging-service-180514&organizationId=960705295332&minLogLevel=0&expandAll=false&resource=cloud_function%2Ffunction_name%2FmessagingServiceE2E";
const displayId = "E2Etest-WATCH-TOKEN";

export default class TokenTest {
  constructor(mstokenKey){
    this.mstokenKey = mstokenKey;
  }

  run() {
    const messagingServiceClient = new MessagingServiceClient(displayId, "12345");
    this.noResponseTimeout = this._setTimeout(messagingServiceClient);

    messagingServiceClient.on("connected", ()=>{
      let message = {
        topic: "WATCH",
        filePath: "messaging-service-test-bucket/test-folder/test-file.txt",
        version: "12345"
      }

      console.log(`Sending ${JSON.stringify(message)}`);
      messagingServiceClient.write(message);
    });

    messagingServiceClient.on("data", (data) => {
      console.log(`Received ${JSON.stringify(data)}`);
      if (!data.token || !data.token.hash) {return;}

      if (verifyToken(data.token.data, data.token.hash, this.mstokenKey)) {
        messagingServiceClient.disconnect();

        console.log("Clearing alert timeout for token test");
        clearTimeout(this.noResponseTimeout);
      } else {
        console.error("Token mismatch - E2E test is probably using the wrong MS token");
      }
    });

    messagingServiceClient.on("error", (error)=>{
      sendNotice("MS E2E Error", JSON.stringify(error));
    });
  }

  _setTimeout(client) {
    return setTimeout(()=>{
      console.log("Sending failure alert for token test");
      sendNotice(`MS WATCH token test failed`, `See logs at ${logPath}`);
      client.disconnect();
    }, timeout);
  }
}
