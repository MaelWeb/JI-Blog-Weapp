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
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
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
        this.getArticles(1)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading ) {
            this.getArticles(page + 1);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '「JI · 记小栈」- 游记',
            path: '/pages/travel/travel',
            // imageUrl: this.data.travels[0] ? 'https:' + this.data.travels[0].banner : 'https://cdn.liayal.com/12027196.jpg'
        }
    },
    getArticles: function(page) {
        this.isLoading = true;
        // wx.showLoading({
        //     title: '加载中....',
        //     mask: true
        // });
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                category: 'TRAVEL',
                page: page,
            }
        })
        .then(res => {
            res.articles.forEach( article => {
                article.date = this.formatTime(article.createTime);
            });

            let articles = this.data.travels.concat(res.articles);

            this.setData({
                travels: page == 1 ? res.articles : articles,
                page: res.page,
                allPage: res.allPage
            });
            this.isLoading = false;
            wx.hideLoading();
            wx.stopPullDownRefresh();
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