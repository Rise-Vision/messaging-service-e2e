import MessagingServiceClient from "./messaging-service-client";
import HipChatClient from "./hipChatClient";
const timeout = 10000;

export default class Test {
  constructor(hipChatAPIKey){
      this.hasFinished = false;
      this.hipChatClient = new HipChatClient(hipChatAPIKey);
  }

  run() {
    const messagingServiceClient = new MessagingServiceClient();

    messagingServiceClient.on("connected", ()=>{
      let message = {
        msg: "WATCH",
        data: {
          displayId: "",
          filePath: "",
          version: ""
        }
      }

      messagingServiceClient.write(message);
      this._setTimeout();
    });

    messagingServiceClient.on("data", (data) => {
      if(!data.includes("Messaging Service WebSocket Connected: messaging-service")){
        this.hipChatClient.postAlert("Get no connection response from the messaging service");
      } else if(data !== {}) {
        this.hipChatClient.postAlert("Couldn't get the empty data when sending a WATCH message");
      }
      messagingServiceClient.disconnect();
      this.hasFinished = true;
    });

    messagingServiceClient.on("error", (error)=>{
      hipChatClient.postAlert(JSON.stringify(error));
    });
  }

  _setTimeout() {
    let testTimeout = setTimeout(()=>{
      if(!this.hasFinished) {
        this.hipChatClient.postAlert("Got no response from messaging service");
      }
      clearTimeout(testTimeout);
    }, timeout);
  }
}
