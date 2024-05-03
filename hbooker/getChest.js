const axios = require('axios');
const CryptoJS = require("crypto-js");
const config = require("./config.json");

var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')
const decrypt = function(data, key) {
    key = CryptoJS.SHA256(key ? key : 'zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn')
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        mode: CryptoJS.mode.CBC,
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
}

// Define the push notification function
async function sendPushNotification(pushToken, title, content) {
  let response = await axios({
      method: 'post',
      url: 'http://pushplus.hxtrip.com/send',
      data: {
          token: pushToken,
          title: title,
          content: content
      }
  });
  console.log(response.data);
}

function CGet(url, params) {
    return new Promise(async (resolve) => {
        try {
            // ... your existing code ...

            // Add this line to send a push notification if an error occurs:
            if (json.code !== 100000) {
                await sendPushNotification(config.pushToken, 'Error during CGet', json.tip);
            }
        } catch (err) {
            // ... your existing code ...

            // Add this line to send a push notification if an error occurs:
            await sendPushNotification(config.pushToken, 'Error during CGet', err.message || err.code);
        }
        resolve();
    });
}

async function hbooker() {
    // ... your existing code ...

    while (true) {
        // ... your existing loop code ...

        // If the chest was opened successfully, send a push notification with the results:
        if(openRes.code == 100000) {
            msg = openRes.data.item_name.match(/经验值/)?("经验值 * "+openRes.data.item_num) :(openRes.data.item_name +" * "+openRes.data.item_num);
            await sendPushNotification(config.pushToken, 'Chest opened successfully', msg);
        }
        // If there was an error opening the chest, send a push notification with the error message:
        else {
            msg = openRes.tip;
            await sendPushNotification(config.pushToken, 'Error opening chest', msg);
        }

        // ... rest of your loop code ...
    }
}

hbooker();
