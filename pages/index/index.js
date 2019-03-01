import Request from '../../utils/request';
import { Host } from '../../config/index';
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        banners: [],
        tags: [],
        curTagId: '',
        page: 1,
        allNum: 0
    },
    onLoad: function() {
        // if (app.globalData.userInfo) {
        //   this.setData({
        //     userInfo: app.globalData.userInfo,
        //     hasUserInfo: true
        //   })
        // } else if (this.data.canIUse){
        //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //   // 所以此处加入 callback 以防止这种情况
        //   app.userInfoReadyCallback = res => {
        //     this.setData({
        //       userInfo: res.userInfo,
        //       hasUserInfo: true
        //     })
        //   }
        // } else {
        //   // 在没有 open-type=getUserInfo 版本的兼容处理
        //   wx.getUserInfo({
        //     success: res => {
        //       app.globalData.userInfo = res.userInfo
        //       this.setData({
        //         userInfo: res.userInfo,
        //         hasUserInfo: true
        //       })
        //     }
        //   })
        // }
    },
    onShow: function() {
        this.getBanner();
        this.getArticles(1, null);
        this.getAllTags();
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    getBanner: function() {
        Request.get(`${Host}/get/banners`, {
            params: {
                page: 'HOME'
            }
        })
        .then( res => {
            this.setData({
                banners: res.banners
            });
        })
    },
    getAllTags: function() {
        Request.get(`${Host}/get/alltags`)
            .then( res => {
                this.setData({
                    tags: res.tags.slice(0, 9)
                })
            })
    },
    getArticles: function(page, tagid) {
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                tag: tagid || '',
                category: 'DEFAULT',
                page
            }
        })
        .then( res => {
            this.setData({
                articles: res.articles,
                curTagId: tagid || '',
                allNum: res.allNum,
                page: res.page
            })
        })
    }
})