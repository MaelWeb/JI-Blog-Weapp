import Request from '../../utils/request';
import { Host } from '../../config/index';
import { formatTime } from '../../utils/util';
//获取应用实例
const App = getApp()
// pages/trave.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        allPage: 1,
        travels: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getArticles(1);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    getArticles: function(_page) {
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                category: 'TRAVEL',
                page: _page,
            }
        })
        .then(res => {
            res.articles.forEach( article => {
                article.date = this.formatTime(article.createTime);
            });

            let articles = this.data.travels.concat(res.articles);

            this.setData({
                travels: articles,
                page: res.page,
                allPage: res.allPage
            })
        });
    },
    formatTime: function(time) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}年${month}月${day}日`;
    }
})