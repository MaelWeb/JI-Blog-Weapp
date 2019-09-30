import Request from '../../utils/request';
import { Host } from '../../config/index';
import * as Utils from '../../utils/util';
Page({
    data: {
        books: [],
        titleConfig: {
            bgColor: 'transparent',
            iconColor: '#fff',
            title: '',
        },
        page: 1,
        allPage: 0,
        showLoading: false,
    },
    isLoading: false,
    bannerHeight: Utils.rpxTopx(800),
    onLoad() {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        this.getBooks(1);
        this.getBanners();
    },
    onPageScroll(option) {
        const { titleConfig } = this.data;
        if (option.scrollTop > this.bannerHeight && !titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '阅记',
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
        this.getBooks(1);
        this.getBanners();
    },
    onReachBottom() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading) {
            this.getBooks(page + 1);
        }
    },
    onShareAppMessage() {
        return {
            title: '「JI · 记小栈」- 阅记',
            path: '/pages/read/read',
        };
    },
    getBanners() {
        Request.get(`${Host}/get/banners`, {
            params: {
                page: 'BOOK'
            }
        })
            .then((res) => {
            this.setData({
                banner: res.banners[0]
            });
        });
    },
    getBooks(page = 1) {
        this.isLoading = true;
        Request.get(`${Host}/get/books`, {
            params: {
                page: page,
            }
        })
            .then((res) => {
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
});
