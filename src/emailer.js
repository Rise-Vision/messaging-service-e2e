import querystring from "querystring";
import https from "https";
import url from "url";

const apiUrl = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
export const targetEmail = "delivery@risevision.com";

const addressData = {
  from: "monitor@risevision.com",
  fromName: "Messaging Service",
  recipients: targetEmail
};

export function sendNotice(subject, text) {
  const mailHeader = Object.assign({subject, text}, addressData);
  const urlObj = url.parse(`${apiUrl}?${querystring.stringify(mailHeader)}`);

  const req = https.request(Object.assign({method: "POST"}, urlObj), resp=>{
    if (resp.statusCode !== 200) {
      console.error(`${resp.statusCode} ${resp.statusMessage}`);
    }

    resp.resume();
  });

  req.on("error", console.error);
  req.end();
};
