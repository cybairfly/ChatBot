const request = require('request');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.VERIFY_TOKEN;

const baseURL = `https://graph.facebook.com/v2.6/`;
const ConfigBase = (url, method, baseURL) => ({
  url,
  method,
  baseURL
});

async function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {

    const username = await getUserName(sender_psid);

    // Create the payload for a basic text message
    response = {
      "text": `${username}: ${received_message.text}`
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

async function getUserName(sender_psid) {
  const config = ConfigBase(`${sender_psid}?fields=first_name&access_token=${PAGE_ACCESS_TOKEN}`, 'get', baseURL);
  const profile = await axios(config);
  return profile.data.first_name;
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response, username) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Posted back: ', response.text);
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

module.exports = {
  handleMessage,
  handlePostback,
  getUserName,
  callSendAPI
}
