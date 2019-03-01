import Request from '../../utils/request';
import { Host } from '../../config/index';
// pages/read.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        books: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        this.getBooks(1);
        this.getBanners();
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
        this.getBooks(1);
        this.getBanners();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading ) {
            this.getBooks(page + 1);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '「JI · 记小栈」- 阅记',
            path: '/pages/read/read',
        }
    },
    getBanners: function() {
        Request.get(`${Host}/get/banners`, {
            params: {
                page: 'BOOK'
            }
        })
        .then(res => {
            this.setData({
                banner: res.banners[0]
            })
        });
    },
    getBooks: function(page) {
        this.isLoading = true;
        // wx.showLoading({
        //     title: '加载中....',
        //     mask: true
        // });
        Request.get(`${Host}/get/books`, {
            params: {
                page: page,
            }
        })
        .then(res => {
            this.setData({
                books: page == 1 ? res.books : this.data.books.concat(res.books),
                page: res.page,
                allPage: res.allPage,
            });
            this.isLoading = false;
            wx.hideLoading();
            wx.stopPullDownRefresh();
        });
    }
})