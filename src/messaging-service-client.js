import Primus from "primus";
import prodConfig from "./config/prod.js";
import EventEmitter from 'events';

export default class MessagingServiceClient extends EventEmitter {

  constructor(displayId, machineId) {
    super();
    const Socket = Primus.createSocket({transformer: "websockets", pathname: '/messaging/primus'});

    this.connection = new Socket(`${prodConfig.messagingServiceURL}?displayId=${displayId}&machineId=${machineId}`, {
      reconnect: {
        max: 1800000,
        min: 5000,
        retries: Infinity
      }
    });

    this.connection.on("open", ()=>{
      console.log(`messaging service connected for ${displayId}`);
      this.emit("connected");
    });

    this.connection.on("close", ()=>{
      console.log(`messaging service connection closed for ${displayId}`);
      this.emit("closed");
    });

    this.connection.on("end", ()=>{
      console.log(`messaging service disconnected for ${displayId}`);
      this.emit("disconnected");
    });

    this.connection.on("data", (data)=>{
      this.emit("data", data);
    });

    this.connection.on("error", (error)=>{
      console.log(`messaging error for ${displayId}`);
      this.emit("error", error);
    });
  }

  write(message) {
    return this.connection.write(message);
  }

  disconnect() {
    if (this.connection) {this.connection.end();}
  }
}
