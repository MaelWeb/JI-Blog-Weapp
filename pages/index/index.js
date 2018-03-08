import Request from '../../utils/request';
import { Host } from '../../config/index';
import { formatTime } from '../../utils/util';
//获取应用实例
const App = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        banners: [],
        tags: [],
        articles: [],
        curTagId: '',
        isShowFixedTag: false
    },
    onLoad: function() {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        this.getBanner();
        this.getArticles(1, '');
        this.getAllTags();
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
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        const { curTagId } = this.data;
        this.getArticles(1, curTagId)
    },
    onReachBottom: function() {
        const { allPage, page, curTagId } = this.data;
        if (page < allPage && !this.isLoading ) {
            this.getArticles(page + 1, curTagId);
        }
    },
    onPageScroll: function({scrollTop}) {
        if ((scrollTop > 200) && !this.data.isShowFixedTag ) {
            this.setData({
                isShowFixedTag: true
            })
        } else if ( (scrollTop < 200) && this.data.isShowFixedTag ) {
            this.setData({
                isShowFixedTag: false
            })
        }
    },
    getUserInfo: function(e) {
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
        this.isLoading = true;
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                tag: tagid || '',
                category: 'DEFAULT',
                page
            }
        })
        .then( res => {
            res.articles = res.articles.map(article => {
                article.date = formatTime(article.createTime);

                return article;
            });
            this.setData({
                articles: page == 1 ? res.articles : this.data.articles.concat(res.articles),
                curTagId: tagid,
                allNum: res.allNum,
                page: res.page,
                allPage: res.allPage
            });
            this.isLoading = false;
            wx.hideLoading();
        })
    },
    changeTag: function(event) {
        let id = event.currentTarget.dataset.id;
        this.getArticles(1, id);
    },
    goToArticle: function(event) {
        let articleId = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/article/article?id=${articleId}`
        })
    }
})