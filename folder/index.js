const EventEmitter = require("events");
const timeout = 530000;
const Primus = require("primus");
const msUrl = "https://services.risevision.com/messaging/primus?displayId=ms-e2e-folder-test&machineId=12345";
const bucket = "messaging-service-e2e-folder";
const folder = "test-parent-folder/test-sub-folder/";
const storage = require("@google-cloud/storage")({
  project: "avid-life-623"
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

exports.messagingServiceE2EFolder = function messagingServiceE2EFolder (req, res) {
  const testEvents = new EventEmitter()
  const executionId = req.headers["function-execution-id"];

  console.log(`E2E - Folder Test - ${executionId}`);

  submitWatch(testEvents)
  .then(()=>uploadFile(executionId));

  expectMessageFor(executionId, testEvents);

  res && res.status(200).send("");
};

function submitWatch(testEvents) {
  const Socket = Primus.createSocket({
    transformer: "websockets",
    pathname: "messaging/primus",
    parser: "json"
  });

  console.log("connecting to " + msUrl);
  const conn = new Socket(msUrl, {pingTimeout:45000})

  conn.on("open", ()=>{
    conn.write({
      topic: "watch",
      version: "0",
      filePath: `${bucket}/${folder}`
    });
    console.log(`watching ${bucket}/${folder}`);
  });

  conn.on("data", data=>{
    testEvents.emit("ms-message", data);
  });

  testEvents.on("quit", ()=>{
    conn.destroy();
    testEvents.removeAllListeners();
  });

  return new Promise((res, rej)=>{
    testEvents.once("ms-message", data=>{
      if (data.topic === "watch-result") {res();}
    });
  });
}

function uploadFile(idAsFilename) {
  const tempLocalFileName = `/tmp/${idAsFilename}`;
  const gcsFileName = `${folder}${idAsFilename}`;

  return writeLocalFile(tempLocalFileName, "test-data")
  .then(()=>{
    console.log(`Uploading file for ${idAsFilename} to ${bucket}/${gcsFileName}`);
    return storage.bucket(bucket)
    .upload(tempLocalFileName, {destination: gcsFileName})
    .then(()=>{
      console.log(`Test file ${idAsFilename} uploaded successfully`);
    });
  })
  .catch(console.error.bind(console));
}

function expectMessageFor(file, testEvents) {
  const failedTestTimeout = setTimeout(()=>{
    console.warn(`failed - no ADD message received for ${file}`);
    testEvents.emit("quit");
  }, timeout);

  console.log(`waiting for add message for ${bucket}/${folder}${file}`);
  testEvents.on("ms-message", data=>{
    if (!data || data.topic !== "MSFILEUPDATE") {return;}
    if (data.type === "ADD" && data.filePath === `${bucket}/${folder}${file}`) {
      console.log(`received ADD message for ${file} - quitting`);
      clearTimeout(failedTestTimeout);
      testEvents.emit("quit");
    }
  });
}

function writeLocalFile(fileName, data) {
  return new Promise((res, rej)=>{
    require("fs").writeFile(fileName, data, err=>{
      if (err) {return rej(err);}
      res();
    });
  });
}

if (process.env.NODE_ENV === "test") {
  exports.messagingServiceE2EFolder({headers: {"function-execution-id": String(Math.random())}});
}
