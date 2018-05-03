import querystring from "querystring";
import url from "url";
import {JWT} from "google-auth-library";

const apiUrl = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
export const targetEmail = "delivery@risevision.com";

const addressData = {
  from: "monitor@risevision.com",
  fromName: "Messaging Service",
  recipients: targetEmail
};

let client = null;

function getApiClient() {
  if (client) {return client;}

  if (!process.env.EMAIL_API_CREDENTIALS) {
    throw new Error("Service account key json file env variable is not configure. Cannnot create email API client");
  }

  const keys = require(process.env.EMAIL_API_CREDENTIALS);
  client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/userinfo.email']
  });
  return client;
}

export function sendNotice(subject, text, apiClient = getApiClient()) {
  const mailHeader = Object.assign({subject}, addressData);
  const url = `${apiUrl}?${querystring.stringify(mailHeader)}`;

  const options = {
    url,
    method: "POST",
    data: {text}
  };

  return apiClient.request(options).then(resp=>{
    if (resp.statusCode !== 200) {
      console.error(`${resp.statusCode} ${resp.statusMessage}`);
    }

    return resp.body;
  });
};
