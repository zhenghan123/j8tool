const axios = require("axios");
const CryptoJS = require("crypto-js");
const config = require("./config.json");
const sendmsg = require('../sendmsg.js');

var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

const decrypt = function(data, key) {
    key = CryptoJS.SHA256(key ? key : 'zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn')
    const decrypted = CryptoJS.AES.decrypt(data, key, {
        mode: CryptoJS.mode.CBC,
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
}

function CGet(url, params) {
    return new Promise(async (resolve, reject) => {
        try {
            params += `&app_version=2.3.922&device_token=${device_token}&login_token=${token}&account=${username}`
            url = "https://app.hbooker.com" + url;
            const response = await axios.post(url, params);
            let data = decrypt(response.data.trim());
            const lastIndex = data.lastIndexOf("}");
            data = data.substr(0, lastIndex + 1);
            const json = JSON.parse(data);
            resolve(json);
        } catch (err) {
            resolve({
                tip: err.message ?? err.code,
                errorwen: true
            });
        }
    });
}

async function hbooker() {
    let cidArr = [];
    while (true) {
        const message = await CGet("/reader/get_message_sys_list_by_type", "count=10&message_type=3&page=0")
        if (message && message.data && message.data.message_sys_list) {
            const cid = message.data.message_sys_list[0].chest_id
            if (!cidArr.includes(cid)) {
                let chestInfo = await CGet("/chest/get_chest_detail", `chest_id=${cid}&module=ouhuang&count=10&page=0`)
                if (chestInfo.code == 100000) {
                    chestInfo = chestInfo.data.chest_info
                    const bid = chestInfo.book_info.book_id
                    if (chestInfo.has_opened == 0) {
                        await CGet("/bookshelf/favor", "shelf_id=&book_id=" + bid)
                        let openRes = await CGet("/chest/open_chest", `chest_id=${cid}`)                        
                        let errorwen = openRes.error
                        await CGet("/bookshelf/favor", "shelf_id=&book_id=" + bid)                      
                        while(errorwen) {
                            openRes = await CGet("/chest/open_chest", `chest_id=${cid}`)
                            await sleep(1000)
                            if (!openRes.errorwen) errorwen = false
                        }  
                        let msg;
                        if(openRes.code == 100000) 
                            msg = openRes.data.item_name.match(/经验值/)?("经验值 * "+openRes.data.item_num) :(openRes.data.item_name +" * "+openRes.data.item_num)
                        
                        else 
                            msg = openRes.tip

                        // 通过pushplus推送成功信息
                        await sendmsg(msg);
                        await CGet("/bookshelf/delete_shelf_book", "shelf_id=&book_id=" + bid)
                    } else {
                        cidArr.push(cid);
                    }
                }
            }
        }
        await sleep(1000 * 60 * 5)
    }
}

hbooker();
