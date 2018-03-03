class _Request {
    constructor() {

    }

    get(url, config = {}) {
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                data: config.params || {},
                method: 'GET',
                success: function(res) {
                    if (res.statusCode == 200 ) {
                        resolve(res.data);
                    } else {
                        reject(res);
                    }
                },
                fail: function(err) {
                    if (res.errMsg && res.errMsg == 'request:fail timeout') {
                        reject({
                            code: 5004,
                            message: '请求超时'
                        })
                    } else {
                        reject(res);
                    }
                }
            })
        })
    }
}

const Request = new _Request();

export default Request;