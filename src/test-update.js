import MessagingServiceClient from "./messaging-service-client";
import {sendNotice} from "./emailer.js";
import Storage from "@google-cloud/storage";

const timeout = 530000;
const logPath = "https://console.cloud.google.com/logs/viewer?project=messaging-service-180514&organizationId=960705295332&minLogLevel=0&expandAll=false&resource=cloud_function%2Ffunction_name%2FmessagingServiceE2E"
const bucket = "messaging-service-test-bucket";
const gcsFileName = "test-folder/test-file-for-update.txt";
const displayId = "E2Etest-WATCH-UPDATE";
const uploadTimeout = 8000;
let displayIdCounter = 0;

export default class UpdateTest {
  constructor(){
    this.timeoutWasCleared = false;
    this.storage = Storage({
      projectId: "avid-life-623"
    });
  }

  run() {
    displayIdCounter++;
    if (displayIdCounter > 9) {displayIdCounter = 0}
    this.displayId = `${displayId}-${displayIdCounter}`;
    const messagingServiceClient = new MessagingServiceClient(this.displayId, "12345");
    this.noResponseTimeout = this._setTimeout(messagingServiceClient);

    this.timeoutId = this.noResponseTimeout._idleStart;
    console.log(`Created timeout ${this.timeoutId} for UPDATE on ${this.displayId}`);

    messagingServiceClient.on("connected", ()=>{
      let message = {
        topic: "WATCH",
        filePath: `${bucket}/${gcsFileName}`,
        version: "12345"
      }

      console.log(`Sending ${JSON.stringify(message)}`);
      messagingServiceClient.write(message);
    });

    let versiontAtWatchRequest = null;
    let versionAfterUpdate = null;
    messagingServiceClient.on("data", (data) => {
      console.log(`Received ${JSON.stringify(data)} for timeout ${this.timeoutId}`);
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
          console.log(`Clearing alert timeout ${this.timeoutId} for UPDATE`);
          clearTimeout(this.noResponseTimeout);

          let clearedId = this.noResponseTimeout._idleStart;
          console.log(`Cleared alert timeout ${clearedId} for UPDATE`);
          this.timeoutWasCleared = true;
        }
      }
    });

    messagingServiceClient.on("error", (error)=>{
      sendNotice("MS E2E Error", JSON.stringify(error));
    });
  }

  _setTimeout(client) {
    return setTimeout(()=>{
      console.log(`Sending failure alert for update test from timeout ${this.timeoutId}`);
      if (this.timeoutWasCleared) {
        console.log(`The timeout was cleared so why is this running?`);
      }

      sendNotice(`MS WATCH update test failed`, `See logs at ${logPath}`);
      client.disconnect();
    }, timeout);
  }

  updateFileOnGCS() {
    const tempLocalFileName = "/tmp/temp-file";
    const uploadTimer = setTimeout(()=>{
      console.warn(`Upload for ${this.timeoutId} did not complete in ${uploadTimeout}ms. Aborting`);
      clearTimeout(this.noResponseTimeout);
    }, uploadTimeout);

    return this.writeLocalFile(tempLocalFileName, "test-data")
    .then(()=>{
      console.log(`Uploading file to ${gcsFileName}`);
      return this.storage.bucket(bucket)
      .upload(tempLocalFileName, {destination: gcsFileName})
      .then(()=>{
        console.log(`Update test file uploaded successfully for timeout ${this.timeoutId}`);
        clearTimeout(uploadTimer);
      });
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
