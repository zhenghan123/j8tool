const config = require("./config.json");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const pushPlus = require("pushplus-node");

let pushplusToken = '322db9e4f4834325837f7a5390dc7cfa';
let token = config.token;
let username = config.account;
let device_token = config.devicetoken ?? "ciweimao_00000000000000000000000000000000";
let cidArr = []

const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

const decrypt = function (data, key) {
    key = CryptoJS.SHA256(key ? key : 'zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn');
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        mode: CryptoJS.mode.CBC,
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function CGet(url, params) {
    return new Promise(async (resolve) => {
        try {
            params += `&app_version=2.3.922&device_token=${device_token}&login_token=${token}&account=${username}`;
            url = "https://app.hbooker.com" + url;
            let response = await axios.post(url, params);
            let data = decrypt(response.data.trim());
            var lastIndex = data.lastIndexOf("}");
            data = data.substr(0, lastIndex + 1);
            let json = JSON.parse(data);
            resolve(json);
        } catch (err) {
            resolve({
                tip: err.message ?? err.code,
                errorwen: true
            });
        }
        resolve();
    });
}

async function hbooker() {
    while (true) {
        let message = await CGet("/reader/get_message_sys_list_by_type", "count=10&message_type=3&page=0");
        let msg = "";

        // Rest of your code handling the message...

         // Send Notification with pushPlus
        pushPlus.send(pushplusToken, "刺猬猫宝箱", msg);

        // Rest of your code...

        await sleep(1000 * 60 * 5)
    }
}

hbooker();
