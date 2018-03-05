import { Host } from '../../config/index';
import { formatTime } from '../../utils/util';
import Request from '../../utils/request';
import WxParse from '../../utils/wxParse/wxParse';
// pages/article/article.js
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
        Request.get(`${Host}/get/article/${this.options.id}`, {
                params: {
                    filter: 1
                }
            })
            .then(res => {
                let that = this;
                let article = res.article;

                WxParse.wxParse('htmlContent', 'html', article.htmlContent, that, 5);

                this.setData({
                    article: article
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

    }
})