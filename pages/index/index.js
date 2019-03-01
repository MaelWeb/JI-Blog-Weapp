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
        curTagId: '',
        page: 1,
        allNum: 0,
        articles: [],
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
    },
    onShow: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        const { curTagId } = this.data;
        this.getArticles(1, curTagId)
    },
    onReachBottom: function() {
        const { allPage, page, curTagId } = this.data;
        if (page < allPage && !this.isLoading) {
            this.getArticles(page + 1, curTagId);
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '「JI · 记小栈」',
            path: '/pages/index/index',
        }
    },
    onPageScroll: function({ scrollTop }) {
        if ((scrollTop > 200) && !this.data.isShowFixedTag) {
            this.setData({
                isShowFixedTag: true
            })
        } else if ((scrollTop < 200) && this.data.isShowFixedTag) {
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
            .then(res => {
                this.setData({
                    banners: res.banners
                });
            })
    },
    getAllTags: function() {
        Request.get(`${Host}/get/alltags`)
            .then(res => {
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
            .then(res => {
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
                wx.stopPullDownRefresh();
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
        });
    },
    swiperTap: function(event) {
        let href = event.currentTarget.dataset.href,
            localHost = /www\.liayal.com\/article\//g;

        if (localHost.test(href)) {
            let hrefArray = href.split('www.liayal.com/article/');
            wx.navigateTo({
                url: `/pages/article/article?id=${hrefArray[1]}`
            });
        } else {
            wx.showToast({
                title: '外部链接，无法在小程序查看',
                icon: 'none'
            })
        }
    }
})