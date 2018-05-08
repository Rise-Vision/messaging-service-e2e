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

function getCredentials(credentialsBase64) {
  if (credentialsBase64) {
    const credentialsString = Buffer.from(credentialsBase64, 'base64').toString();
    return JSON.parse(credentialsString);    
  }

  if (!process.env.EMAIL_API_CREDENTIALS) {
    throw new Error("Service account key json file env variable is not configured. Cannnot create email API client");
  }

  return require(process.env.EMAIL_API_CREDENTIALS);
}

export function initApiClient(credentialsBase64) {
  if (client) { return client; }

  const keys = getCredentials(credentialsBase64);
  client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/userinfo.email']
  });
  return client;
}

export function sendNotice(subject, text, apiClient = initApiClient()) {
  const mailHeader = Object.assign({subject}, addressData);
  const url = `${apiUrl}?${querystring.stringify(mailHeader)}`;

  const options = {
    url,
    method: "POST",
    data: {text}
  };

  return apiClient.request(options).then(resp=>{
    if (resp.status !== 200) {
      console.error(`${resp.status} ${resp.statusText}`);
    }

    return resp.body;
  });
};
