import Request from '../../utils/request';
import { Host } from '../../config/index';
//获取应用实例
const App = getApp()
// pages/photo/photo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        photos: [],
        photoUrls: [],
        page: 1,
        allPage: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        this.getPhotos(1);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

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
        this.getPhotos(1);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if ( (this.data.page < this.data.allPage) && !this.isloading) {
            this.getPhotos(this.data.page + 1);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '「JI · 记小栈」- 图记',
            path: '/pages/photo/photo',
            // imageUrl: this.data.photos[0] ? this.data.photos[0].src : 'https://cdn.liayal.com/14506926.jpg'
        }
    },
    getPhotos(page) {
        this.isloading = true;
        // wx.showLoading({
        //     title: '加载中....',
        //     mask: true
        // });
        Request.get(`${Host}/get/photos`, { params: { page } })
            .then(res => {
                let photoUrls = [],
                    photos = [];

                res.photos.map(photo => {
                    photo.src = `https://cdn.liayal.com/${photo.key}`;

                    photoUrls.push(photo.src);
                    photos.push(photo);
                });
                this.setData({
                    page,
                    photos: page == 1 ? photos : this.data.photos.concat(photos),
                    photoUrls: page == 1 ? photoUrls : this.data.photoUrls.concat(photoUrls),
                    allPage: res.allPage
                }, () => {
                    wx.hideLoading();
                    wx.stopPullDownRefresh();
                });
                this.isloading = false;
            })
    },
    previewImage: function(event) {
        let src = event.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: this.data.photoUrls
        });
    }
})