import querystring from "querystring";
import url from "url";
import {auth} from "google-auth-library";

const apiUrl = "http://lock-down-email-endpoint-with-a-list-of-accounts.rvacore-test.appspot.com/_ah/api/rise/v0/email";
export const targetEmail = "delivery@risevision.com";

const addressData = {
  from: "monitor@risevision.com",
  fromName: "Messaging Service",
  recipients: targetEmail
};

let client = null;

function getApiClient() {
  if (client) {return client;}

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Service account key json file env variable is not configure. Cannnot create email API client");
  }

  return auth;
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
