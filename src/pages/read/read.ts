import Request from '@Utils/request';
import { Host } from '@Config/index';
import * as Utils from '@Utils/util'

// pages/read.js
Page({

    /**
     * 页面的初始数据
     */
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
        $titleBarHeight: 44,
    },
    isLoading: false,
    bannerHeight: Utils.rpxTopx(800),
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        wx.showLoading({
            title: '加载中....',
            mask: true
        });
        this.getBooks(1);
        this.getBanners();
    },
    onPageScroll(option: { scrollTop: number }) {
        const { titleConfig } = this.data
        if (option.scrollTop > (this.bannerHeight - this.data.$titleBarHeight) && !titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '阅记',
                },
            })
        } else if (option.scrollTop < (this.bannerHeight - this.data.$titleBarHeight) && titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: 'transparent',
                    iconColor: '#fff',
                    title: '',
                },
            })
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.getBooks(1);
        this.getBanners();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading ) {
            this.getBooks(page + 1);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '「JI · 记小栈」- 阅记',
            path: '/pages/read/read',
        }
    },
    getBanners() {
        Request.get(`${Host}/get/banners`, {
            params: {
                page: 'BOOK'
            }
        })
        .then((res: ResData) => {
            this.setData!({
                banner: res.banners[0]
            })
        });
    },
    getBooks(page = 1) {
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
        .then((res: ResData) => {
            this.setData!({
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