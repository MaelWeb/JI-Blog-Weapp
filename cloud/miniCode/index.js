const cloud = require('wx-server-sdk')

cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取小程序码
exports.main = async (event, context) => {
    try {
        const result = await cloud.openapi.wxacode.get({
            path: event.path || 'page/index/index',
            width: 430
        })
        return result
    } catch (err) {
        return err
    }
}