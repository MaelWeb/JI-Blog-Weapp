import Request from '../../utils/request';
import { Host } from '../../config/index';
import * as Utils from '../../utils/util';
Page({
    data: {
        page: 1,
        allPage: 1,
        travels: [],
        titleConfig: {
            bgColor: 'transparent',
            iconColor: '#fff',
            title: '',
        },
        showLoading: false,
    },
    isLoading: false,
    bannerHeight: Utils.rpxTopx(500),
    onLoad() {
        this.setData({
            showLoading: true,
        });
        this.isLoading = true;
        this.getArticles(1);
    },
    onPageScroll(option) {
        const { titleConfig } = this.data;
        if (option.scrollTop > this.bannerHeight && !titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '游记',
                },
            });
        }
        else if (option.scrollTop < this.bannerHeight && titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: 'transparent',
                    iconColor: '#fff',
                    title: '',
                },
            });
        }
    },
    onPullDownRefresh() {
        this.getArticles(1);
    },
    onReachBottom() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading) {
            this.getArticles(page + 1);
        }
    },
    onShareAppMessage() {
        return {
            title: '「JI · 记小栈」- 游记',
            path: '/pages/travel/travel',
        };
    },
    getArticles(page = 0) {
        this.isLoading = true;
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                category: 'TRAVEL',
                page: page,
            }
        })
            .then((res) => {
            res.articles.forEach((article) => {
                article.date = this.formatTime(article.createTime);
            });
            let articles = this.data.travels.concat(res.articles);
            this.setData({
                travels: page == 1 ? res.articles : articles,
                page: res.page,
                allPage: res.allPage
            }, () => {
                this.setData({
                    showLoading: false,
                });
            });
            this.isLoading = false;
            wx.hideLoading();
            wx.stopPullDownRefresh();
        });
    },
    formatTime(time) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }
});
