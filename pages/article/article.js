import { Host } from '../../config/index';
import { formatTime } from '../../utils/util';
import Request from '../../utils/request';
import _Towxml from '../../utils//towxml/main';
// pages/article/article.js
const Towxml = new _Towxml();
Page({

    /**
     * 页面的初始数据
     */
    data: {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.options = options;
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
        this.getArticle();
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
        this.getArticle();
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
    getArticle: function() {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        Request.get(`${Host}/get/article/${this.options.id}`, {
                params: {
                    filter: "weapp"
                }
            })
            .then(res => {
                let that = this;
                let article = res.article;

                article.htmlContent = Towxml.toJson(article.content, 'markdown');
                article.date = this.formatTime(article.createTime);

                this.setData({
                    article: article
                }, () => {
                    wx.hideLoading();
                    wx.stopPullDownRefresh();
                });
            })

        Request.get(`${Host}/get/comments`, {
                params: {
                    articleid: this.options.id
                }
            })
            .then(res => {
                this.setData({
                    comments: res.comments
                })
            })
    },
    formatTime: time => {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}年${month}月${day}日`;
    }
})