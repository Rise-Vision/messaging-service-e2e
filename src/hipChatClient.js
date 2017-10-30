import HipChat from "node-hipchat";
import EventEmitter from 'events';

export default class HipChatClient extends EventEmitter {

  constructor(key) {
    super();
    this.hipChat = new HipChat(key);
  }

  postAlert(message) {

    let params = {
      room: "Delivery",
      from: 'ms-e2e',
      message: (message) ? message : 'Failure on e2e tests',
      color: 'red',
      notify: true,
    };
    this.hipChat.postMessage(params, (error, data) => {
      if (error) console.log(error);
      this.emit("posted", data);
    });
  }

}
