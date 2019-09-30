import Request from '../../utils/request';
import { Host } from '../../config/index';
import { formatTime, getOffsetInfo } from '../../utils/util';
Page({
    data: {
        banners: [],
        tags: [],
        curTagId: '',
        page: 1,
        allNum: 0,
        allPage: 0,
        articles: [{}],
        isShowFixedTag: false,
        $titleBarHeight: 0,
        isShowMenu: false,
        showLoading: false,
    },
    isLoading: false,
    onLoad() {
        this.setData({
            showLoading: true,
        });
        this.getBanner();
        this.getArticles(1, '');
        this.getAllTags();
        this.getDate();
    },
    swiperHeight: 300,
    onShow() { },
    onReady() {
        getOffsetInfo('.index-swiper')
            .then((dom) => {
            this.swiperHeight = dom.height;
        });
    },
    onPullDownRefresh() {
        const { curTagId } = this.data;
        this.getArticles(1, curTagId);
    },
    onReachBottom() {
        const { allPage, page, curTagId } = this.data;
        if (page < allPage && !this.isLoading) {
            this.getArticles(page + 1, curTagId);
        }
    },
    onShareAppMessage() {
        return {
            title: '「JI · 记小栈」',
            path: '/pages/index/index',
        };
    },
    onPageScroll(option) {
        if ((option.scrollTop > this.swiperHeight) && !this.data.isShowFixedTag) {
            this.setData({
                isShowFixedTag: true
            });
        }
        else if ((option.scrollTop < this.swiperHeight) && this.data.isShowFixedTag) {
            this.setData({
                isShowFixedTag: false
            });
        }
    },
    getBanner() {
        return Request.get(`${Host}/get/banners`, {
            params: {
                page: 'HOME'
            }
        }).then((data) => {
            this.setData({
                banners: data.banners
            });
            return data;
        });
    },
    getAllTags() {
        return Request.get(`${Host}/get/alltags`)
            .then((res) => {
            this.setData({
                tags: res.tags.slice(0, 9)
            });
            return res;
        });
    },
    getArticles(page, tagid) {
        this.isLoading = true;
        return Request.get(`${Host}/get/publish/articles`, {
            params: {
                tag: tagid || '',
                category: 'DEFAULT',
                page
            }
        }).then((res) => {
            const articles = res.articles.map((article) => {
                article.date = formatTime(article.createTime);
                return article;
            });
            this.setData({
                articles: page == 1 ? articles : this.data.articles.concat(articles),
                curTagId: tagid,
                allNum: res.allNum,
                page: res.page,
                allPage: res.allPage,
                showLoading: false,
            });
            this.isLoading = false;
            wx.hideLoading();
            wx.stopPullDownRefresh();
            return res;
        });
    },
    changeTag(event) {
        let id = event.currentTarget.dataset.id;
        this.getArticles(1, id);
    },
    goToArticle(event) {
        let articleId = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/article/article?id=${articleId}`
        });
    },
    swiperTap(event) {
        let href = event.currentTarget.dataset.href, localHost = /www\.liayal.com\/article\//g;
        if (localHost.test(href)) {
            let hrefArray = href.split('www.liayal.com/article/');
            wx.navigateTo({
                url: `/pages/article/article?id=${hrefArray[1]}`
            });
        }
        else {
            wx.showToast({
                title: '外部链接，无法在小程序查看',
                icon: 'none'
            });
        }
    },
    getDate() {
        const day = new Date().toDateString();
        const dayArray = day.split(" ");
        this.setData({
            date: `${dayArray[0]} ${dayArray[2]} ${dayArray[1]}`
        });
    },
    showMenu() {
        this.setData({
            isShowMenu: true,
        });
    }
});
