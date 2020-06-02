const WCloud = require('wx-server-sdk')
const Qiniu = require('qiniu')

// AccessKey/SecretKey
const AK = 'v6NxwNQtqVpK0Z51X0iq-YXv0Fo8qlFcVxnlYbO6'
const SK = 'b5p89rqZeO8KJEjEvOp3Pk2fHtKEToE5PdSmQLRq'

WCloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: WCloud.DYNAMIC_CURRENT_ENV
})

function fileUpload(buffer, key) {
    return new Promise((resolve, reject) => {
        const mac = new Qiniu.auth.digest.Mac(AK, SK);
        const options = {
            scope: 'hynal-static'
        }
        const putPolicy = new Qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);
        const config = new Qiniu.conf.Config();
        // 空间对应的机房
        config.zone = Qiniu.zone.Zone_z0;
        // 是否使用https域名
        //config.useHttpsDomain = true;
        // 上传是否使用cdn加速
        //config.useCdnDomain = true
        const formUploader = new Qiniu.form_up.FormUploader(config);
        const putExtra = new Qiniu.form_up.PutExtra();

        formUploader.put(uploadToken, `code/${key}`, buffer, putExtra, function (respErr,
            respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody)
            } else {
                reject(respBody)
            }
        });
    })
}

// 获取小程序码
exports.main = async (event, context) => {
    try {
        const codeResult = await WCloud.openapi.wxacode.get({
            path: event.path || 'page/index/index',
            width: 430
        })
        if (codeResult.errCode === 0) {
            const qiniuRes = await fileUpload(codeResult.buffer, event.id || +new Date())
            const res =  {
                code: 200,
                url: `https://static.liayal.com/${qiniuRes.key}`
            }
            return res
        }
        return codeResult
    } catch (err) {
        return err
    }
}