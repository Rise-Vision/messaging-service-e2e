import MessagingServiceClient from "./messaging-service-client";
import HipChatClient from "./hipChatClient";
import verifyToken from "./token/verify-token";
const timeout = 10000;
const logPath = "https://console.cloud.google.com/logs/viewer?project=messaging-service-180514&organizationId=960705295332&minLogLevel=0&expandAll=false&resource=cloud_function%2Ffunction_name%2FmessagingServiceE2E";
const displayId = "E2Etest-WATCH-TOKEN";

export default class TokenTest {
  constructor(hipChatAPIKey, mstokenKey){
    this.hipChatClient = new HipChatClient(hipChatAPIKey);
    this.mstokenKey = mstokenKey;
  }

  run() {
    const messagingServiceClient = new MessagingServiceClient();
    this.noResponseTimeout = this._setTimeout(messagingServiceClient);

    messagingServiceClient.on("connected", ()=>{
      let message = {
        topic: "WATCH",
        displayId: displayId,
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
      }
    });

    messagingServiceClient.on("error", (error)=>{
      this.hipChatClient.postAlert(JSON.stringify(error));
    });
  }

  _setTimeout(client) {
    return setTimeout(()=>{
      console.log("Sending failure alert for token test");
      this.hipChatClient.postAlert(`MS WATCH token test failed\nSee logs at ${logPath}`);
      client.disconnect();
    }, timeout);
  }
}
