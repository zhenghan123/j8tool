const axios = require('axios');
const CryptoJS = require("crypto-js");
const config = require("./config.json");

var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// ...你的其它代码...

async function sendPushNotification(token, title, content) {
  let response = await axios({
      method: 'post',
      url: 'http://pushplus.hxtrip.com/send',
      data: {
          token: token,
          title: title,
          content: content
      }
  });

  console.log(response.data);
}

// ...你的其它代码...

async function hbooker() {
    let result = "【刺猬猫小说】：";
    let msg = "" ;

    // Inside your while loop:
    while (true) {
        let listData = await CGet("/chest/list_chest", `book_id=${bid}`);
        let waittime2 = listData.error ? 30000 : (listData.data[0].left_time + 60);
        let answer = await CGet("/reply/comment/add", `comment_id=${cid}&book_id=${bid}&shelf_id=&content=上`);

        if(answer.code == 100000) {
            let openRes;

            if(answer.data.bonus_switch) {
                console.log(">>去开宝箱");
                openRes = await CGet("/chest/open_chest", `chest_id=${cid}`);
            }

            // If the chest was opened successfully, send a push notification with the results:
            if(openRes && openRes.code == 100000) {
                msg = openRes.data.item_name.match(/经验值/)?("经验值 * "+openRes.data.item_num) :(openRes.data.item_name +" * "+openRes.data.item_num);
                await sendPushNotification(config.token, 'Chest opened successfully', msg);
            }

            console.log(">>>>结果：" + msg);

            if(errorwen) {
                await CGet("/bookshelf/favor", "shelf_id=&book_id=" + bid);
                await sleep(1000);
                if (!openRes.error) errorwen = false;
            }
            // 你的while循环的代码...
        }
    }
}

hbooker();
//module.exports = hbooker()
