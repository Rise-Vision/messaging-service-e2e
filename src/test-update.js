import MessagingServiceClient from "./messaging-service-client";
import HipChatClient from "./hipChatClient";
import verifyToken from "./token/verify-token";
import Storage from "@google-cloud/storage";

const timeout = 30000;
const logPath = "https://console.cloud.google.com/logs/viewer?project=messaging-service-180514&organizationId=960705295332&minLogLevel=0&expandAll=false&resource=cloud_function%2Ffunction_name%2FmessagingServiceE2E"
const bucket = "messaging-service-test-bucket";
const gcsFileName = "test-folder/test-file-for-update.txt";
const displayId = "E2Etest-WATCH-UPDATE";

export default class UpdateTest {
  constructor(hipChatAPIKey, mstokenKey){
    this.hipChatClient = new HipChatClient(hipChatAPIKey);
    this.mstokenKey = mstokenKey;
    this.storage = Storage({
      projectId: "avid-life-623"
    });
  }

  run() {
    const messagingServiceClient = new MessagingServiceClient(displayId, "12345");
    this.noResponseTimeout = this._setTimeout(messagingServiceClient);

    messagingServiceClient.on("connected", ()=>{
      let message = {
        topic: "WATCH",
        displayId: displayId,
        filePath: `${bucket}/${gcsFileName}`,
        version: "12345"
      }

      console.log(`Sending ${JSON.stringify(message)}`);
      messagingServiceClient.write(message);
    });

    let versiontAtWatchRequest = null;
    let versionAfterUpdate = null;
    messagingServiceClient.on("data", (data) => {
      console.log(`Received ${JSON.stringify(data)}`);
      if (!data.version) {return;}

      if (!versiontAtWatchRequest) {
        versiontAtWatchRequest = data.version;
        console.log(`Version at time of WATCH request: ${versiontAtWatchRequest}`);
        this.updateFileOnGCS();
      } else {
        versionAfterUpdate = data.version;
        console.log(`Version after file update: ${versionAfterUpdate}`);

        if (versionAfterUpdate !== versiontAtWatchRequest) {
          messagingServiceClient.disconnect();
          console.log("Clearing alert timeout for update test");
          clearTimeout(this.noResponseTimeout);
        }
      }
    });

    messagingServiceClient.on("error", (error)=>{
      this.hipChatClient.postAlert(JSON.stringify(error));
    });
  }

  _setTimeout(client) {
    return setTimeout(()=>{
      console.error("Sending failure alert for update test");
      this.hipChatClient.postAlert(`MS WATCH update test failed\nSee logs at ${logPath}`);
      client.disconnect();
    }, timeout);
  }

  updateFileOnGCS() {
    const tempLocalFileName = "/tmp/temp-file";
    return this.writeLocalFile(tempLocalFileName, "test-data")
    .then(()=>{
      console.log(`Uploading file to ${gcsFileName}`);
      return this.storage.bucket(bucket)
      .upload(tempLocalFileName, {destination: gcsFileName})
      .then(()=>console.log(`Update test file uploaded successfully`));
    })
    .catch(console.error.bind(console));
  }

  writeLocalFile(fileName, data) {
    return new Promise((res, rej)=>{
      require("fs").writeFile(fileName, data, err=>{
        if (err) {return rej(err);}
        res();
      });
    });
  }
}
