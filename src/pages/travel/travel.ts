import Request from '@Utils/request';
import { Host } from '@Config/index';
import * as Utils from '@Utils/util';

// pages/trave.js
Page({

    /**
     * 页面的初始数据
     */
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.setData!({
            showLoading: true,
        })
        this.isLoading = true
        this.getArticles(1);
    },

    onPageScroll(option: { scrollTop: number }) {
        const { titleConfig } = this.data
        if (option.scrollTop > this.bannerHeight && !titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '游记',
                },
            })
        } else if (option.scrollTop < this.bannerHeight && titleConfig.title) {
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
        this.getArticles(1)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        const { allPage, page } = this.data;
        if (page < allPage && !this.isLoading ) {
            this.getArticles(page + 1);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '「JI · 记小栈」- 游记',
            path: '/pages/travel/travel',
            // imageUrl: this.data.travels[0] ? 'https:' + this.data.travels[0].banner : 'https://cdn.liayal.com/12027196.jpg'
        }
    },
    getArticles(page = 0) {
        this.isLoading = true;
        Request.get(`${Host}/get/publish/articles`, {
            params: {
                category: 'TRAVEL',
                page: page,
            }
        })
        .then((res: ResData) => {
            res.articles.forEach((article: {date: string; createTime: number;}) => {
                article.date = this.formatTime(article.createTime);
            });

            let articles = this.data.travels.concat(res.articles);

            this.setData!({
                travels: page == 1 ? res.articles : articles,
                page: res.page,
                allPage: res.allPage
            }, () => {
                this.setData!({
                    showLoading: false,
                })
            });
            this.isLoading = false;
            wx.hideLoading();
            wx.stopPullDownRefresh();
        });
    },
    formatTime(time: number) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}年${month}月${day}日`;
    }
})