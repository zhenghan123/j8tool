const axios = require("axios");
const config = require("./config.json");

function sendmsg(msg) {
    return new Promise(async (resolve) => {
        try {
            let url = "http://www.pushplus.plus/send";
            let data = {
                "token": config.Push.pushplustoken,
                "title": "签到盒每日任务已完成",
                "content": msg.replace(/\n/g,"<br>"),
                "template": "html"
            }
            let res = await axios.post(url, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (res.data.code == 200) {
                console.log("pushplus:发送成功");
            } else {
                console.log("pushplus:发送失败");
                console.log(res.data.msg);
            }
        } catch (err) {
            console.log("pushplus酱：发送接口调用失败");
            console.log(err);
        }
        resolve();
    });
};
module.exports = sendmsg;
