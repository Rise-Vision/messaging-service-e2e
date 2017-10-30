import Primus from "primus";
import prodConfig from "./config/prod.js";
import EventEmitter from 'events';

export default class MessagingServiceClient extends EventEmitter {

  constructor() {
    super();
    const Socket = Primus.createSocket({transformer: "websockets", pathname: '/messaging/primus'});

    this.connection = new Socket(prodConfig.messagingServiceURL, {
      reconnect: {
        max: 1800000,
        min: 5000,
        retries: Infinity
      }
    });

    this.connection.on("open", ()=>{
      console.log("messaging service connected");
      this.emit("connected");
    });

    this.connection.on("close", ()=>{
      console.log("messaging service connection closed");
      this.emit("closed");
    });

    this.connection.on("end", ()=>{
      console.log("messaging service disconnected");
      this.emit("disconnected");
    });

    this.connection.on("data", (data)=>{
      console.log("message received", JSON.stringify(data));
      this.emit("data", data);
    });

    this.connection.on("error", (error)=>{
      console.log("messaging error");
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
