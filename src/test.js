import MessagingServiceClient from "./messaging-service-client";
import HipChatClient from "./hipChatClient";

export default class Test {
  run(hipChatAPIKey) {
    const messagingServiceClient = new MessagingServiceClient();
    const hipChatClient = new HipChatClient(hipChatAPIKey);

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
    });

    messagingServiceClient.on("data", (data) => {
      if(!data.includes("Messaging Service WebSocket Connected: messaging-service")){
        hipChatClient.postAlert("Get no connection response from the messaging service");
      } else if(data !== {}) {
        hipChatClient.postAlert("Couldn't get the empty data when sending a WATCH message");
      }
      messagingServiceClient.disconnect();
    });

    messagingServiceClient.on("error", (error)=>{
      hipChatClient.postAlert(JSON.stringify(error));
    });
  }
}
