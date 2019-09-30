class _Request {
    constructor() {
    }
    get(url, config = { params: {} }) {
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                data: config.params || {},
                method: 'GET',
                success(res) {
                    if (res.statusCode == 200) {
                        resolve(res.data);
                    }
                    else {
                        reject(res);
                    }
                },
                fail(err) {
                    if (err.errMsg && err.errMsg == 'request:fail timeout') {
                        reject({
                            code: 5004,
                            message: '请求超时'
                        });
                    }
                    else {
                        reject(err);
                    }
                }
            });
        });
    }
}
const Request = new _Request();
export default Request;
