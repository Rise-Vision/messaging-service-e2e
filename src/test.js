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
      messagingServiceClient.disconnect();
    });

    messagingServiceClient.on("error", (error)=>{
      hipChatClient.postAlert(JSON.stringify(error));
    });
  }
}
