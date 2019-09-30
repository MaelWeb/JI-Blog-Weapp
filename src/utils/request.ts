class _Request {
    constructor() {

    }

    get(url: string, config = { params: {} }) {
        return new Promise((resolve: (value: any) => void, reject) => {
            wx.request({
                url,
                data: config.params || {},
                method: 'GET',
                success(res: { [key: string]: any }) {
                    if (res.statusCode == 200) {
                        resolve(res.data);
                    } else {
                        reject(res);
                    }
                },
                fail(err: { [key: string]: any }) {
                    if (err.errMsg && err.errMsg == 'request:fail timeout') {
                        reject({
                            code: 5004,
                            message: '请求超时'
                        })
                    } else {
                        reject(err);
                    }
                }
            })
        })
    }
}

const Request = new _Request();

export default Request;