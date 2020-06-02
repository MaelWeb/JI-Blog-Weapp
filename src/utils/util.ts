import compareVersions, { compare } from './compare-versions'
export { compareVersions, compare }

const formatTime = (time: number): string => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // const hour = date.getHours();
    // const minute = date.getMinutes();
    // const second = date.getSeconds();

    return [year, month, day].map(formatNumber).join(".");
    // return [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = (n: number): string => {
    const _n = n.toString();
    return _n[1] ? `${_n}` : "0" + n;
};

function getSysInfo() {
    let _sysInfo = {};
    try {
        _sysInfo = wx.getSystemInfoSync();
    } catch (e) {
        console.error(e);
    }
    return _sysInfo;
}

export function getPage() {
    if (typeof getCurrentPages != "function") return {};

    let pages = getCurrentPages();
    // 获取当前页面
    return pages && pages.length ? pages[pages.length - 1] : {};
}

export function getOffsetInfo(selector = "") {
    return new Promise((reslove) => {
        // if (this.$domInfo) return reslove(this.$domInfo);
        wx.createSelectorQuery()
            .select(selector)
            .boundingClientRect((res) => {
                reslove(res || {});
            })
            .exec();
    });
}

export function rpxTopx(rpx: number) {
    return (rpx / 750) * wx.getSystemInfoSync().windowWidth;
}

/**
 * 数组分块
 * @param {Array} input 需要分块的数组
 * @param {Number} size 每块数组的大小
 *
 * */
export function arrayChunk(input: any[], size: number) {
    return input.reduce((arr, item, idx) => {
        return idx % size === 0
            ? [...arr, [item]]
            : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    }, []);
}

/**
 * 对象深比较
 *
 * @export
 * @param {*} x
 * @param {*} y
 * @returns boolean
 */
export function deepEqual(x: any, y: any): boolean {
    if (x === y) {
        return true;
    } else if (
        typeof x == "object" &&
        x != null &&
        typeof y == "object" &&
        y != null
    ) {
        if (Object.keys(x).length != Object.keys(y).length) return false;

        for (const prop in x) {
            /* eslint-disable no-prototype-builtins */
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) return false;
            } else return false;
        }

        return true;
    } else return false;
}

/**
 * rpx 单位专为 px
 *
 * @export
 * @param {string} str rpx值，如：30rpx
 * @param {boolean} minus 是否支持负数
 * @returns {number}
 */
export function rpxToPx(str: string, minus?: boolean): number {
    let reg;
    const systemInfo = wx.getSystemInfoSync();
    const screenK = systemInfo.screenWidth / 750;
    if (minus) {
        reg = /^-?[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
    } else {
        reg = /^[0-9]+([.]{1}[0-9]+){0,1}(rpx|px)$/g;
    }
    const results = reg.exec(str);
    if (!str || !results) {
        console.error(`The size: ${str} is illegal`);
        return 0;
    }
    const unit = results[2];
    const value = parseFloat(str);

    let res = 0;
    if (unit === "rpx") {
        res = Math.round(value * screenK);
    } else if (unit === "px") {
        res = value;
    }
    return res;
}

export { formatTime, getSysInfo };
