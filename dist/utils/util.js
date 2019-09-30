const formatTime = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return [year, month, day].map(formatNumber).join('.');
};
const formatNumber = (n) => {
    const _n = n.toString();
    return _n[1] ? `${_n}` : '0' + n;
};
function getSysInfo() {
    let _sysInfo = {};
    try {
        _sysInfo = wx.getSystemInfoSync();
    }
    catch (e) {
        console.error(e);
    }
    return _sysInfo;
}
export function getPage() {
    if (typeof getCurrentPages != 'function')
        return {};
    let pages = getCurrentPages();
    return pages && pages.length ? pages[pages.length - 1] : {};
}
export function getOffsetInfo(selector = '') {
    return new Promise((reslove) => {
        wx.createSelectorQuery()
            .select(selector)
            .boundingClientRect((res) => {
            reslove(res || {});
        })
            .exec();
    });
}
export function rpxTopx(rpx) {
    return rpx / 750 * wx.getSystemInfoSync().windowWidth;
}
export { formatTime, getSysInfo };
