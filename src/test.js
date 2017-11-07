import MessagingServiceClient from "./messaging-service-client";
import HipChatClient from "./hipChatClient";
import verifyToken from "./token/verify-token";
const timeout = 10000;

export default class Test {
  constructor(hipChatAPIKey, mstokenKey){
    this.hipChatClient = new HipChatClient(hipChatAPIKey);
    this.mstokenKey = mstokenKey;
  }

  run() {
    const messagingServiceClient = new MessagingServiceClient();
    this.noResponseTimeout = this._setTimeout(messagingServiceClient);

    messagingServiceClient.on("connected", ()=>{
      let message = {
        msg: "WATCH",
        data: {
          displayId: "12345",
          filePath: "messaging-service-test-bucket/test-folder/test-file.txt",
          version: "12345"
        }
      }

      messagingServiceClient.write(message);
    });

    messagingServiceClient.on("data", (data) => {
      if (!data.token || !data.token.hash) {return;}

      if (verifyToken(data.token.data, data.token.hash, this.mstokenKey)) {
        messagingServiceClient.disconnect();
        clearTimeout(this.noResponseTimeout);
      }
    });

    messagingServiceClient.on("error", (error)=>{
      this.hipChatClient.postAlert(JSON.stringify(error));
    });
  }

  _setTimeout(client) {
    return setTimeout(()=>{
      this.hipChatClient.postAlert("MS WATCH test failed");
      client.disconnect();
    }, timeout);
  }
}
