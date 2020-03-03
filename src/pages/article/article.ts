import { Host } from "@Config/index";
import Request from "@Utils/request";
import { rpxTopx, arrayChunk } from "@Utils/util";
import ArticeWxml from './articeWxml'

type ResData = {
    [key: string]: any;
};
Page({
	/**
	 * 页面的初始数据
	 */
    data: {
        showLoading: false,
        titleConfig: {
            bgColor: "transparent",
            iconColor: "#fff",
            title: "",
        },
        banner: "",
        date: "",
        title: "",
        tags: [],
        $titleBarHeight: 44,
        loadMore: false,
        pages: [-1,],
        pageCount: 0,
    },
    options: {
        id: "",
    },
    layoutMarginTop: 0,
	/**
	 * 生命周期函数--监听页面加载
	 */
    onLoad(options: { id: string }) {
        this.options = options;
        this.getArticle();
    },
    onReady() {
        this.layoutMarginTop = rpxTopx(340);
    },
    onPageScroll(option: { scrollTop: number }) {
        const { titleConfig } = this.data;
        if (
            option.scrollTop >
            this.layoutMarginTop - this.data.$titleBarHeight &&
            !titleConfig.title
        ) {
            this.setData!({
                titleConfig: {
                    bgColor: "#fff",
                    iconColor: "#000",
                    title: this.data.title,
                },
            });
        } else if (
            option.scrollTop <
            this.layoutMarginTop - this.data.$titleBarHeight &&
            titleConfig.title
        ) {
            this.setData!({
                titleConfig: {
                    bgColor: "transparent",
                    iconColor: "#fff",
                    title: "",
                },
            });
        }
    },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
    onPullDownRefresh() {
        this.getArticle();
    },

	/**
	 * 用户点击右上角分享
	 */
    onShareAppMessage() {
        return {
            title: `${this.data.title} - 「JI · 记小栈」`,
            path: `/pages/article/article?id=${this.options.id}`,
            imageUrl: this.data.banner
                ? this.data.banner
                : "https://cdn.liayal.com/article/article_default_banner.jpg",
        };
    },
    getArticle() {
        // wx.showLoading({
        //     title: '加载中....',
        //     mask: true
        // });
        this.setData!({
            showLoading: true,
        });
        Request.get(`${Host}/get/article/${this.options.id}`, {
            params: {
                filter: "weapp",
            },
        }).then((res: ResData) => {
            const { article, wxml } = res;
            const { title, createTime, banner = "", tags = [], visited } = article;
            const wxmls = arrayChunk(wxml.child, 40)
            ArticeWxml.setWxmlData(wxmls)
            const date = this.formatTime(createTime);
            this.setData!(
                {
                    banner,
                    date,
                    title,
                    tags,
                    visited,
                    pages: [0],
                    pageCount: wxmls.length
                },
                this.hideLoading
            );
        });

        // Request.get(`${Host}/get/comments`, {
        // 	params: {
        // 		articleid: this.options.id,
        // 	},
        // }).then((res: ResData) => {
        // 	this.setData!({
        // 		comments: res.comments,
        // 	});
        // });
    },
    hideLoading() {
        this.setData!({
            showLoading: false,
        });
    },
    formatTime(time: number) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}年${month}月${day}日`;
    },
    onReachBottom() {
        const { pages, pageCount, showLoading, loadMore } = this.data
        if (pages.length < pageCount && !showLoading && !loadMore) {
            const _pages = [...pages, pages.length]
            this.setData!!({
                pages: _pages,
                loadMore: true,
            })
        }
    },
    componentDidUpdate() {
        this.setData!!({
            loadMore: false,
        })
    },
});
