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
    const self = this;
    this.hipChat.postMessage(params, function(error, data) {
      if (error) console.log(error);
      self.emit("posted", data);
    });
  }

}
