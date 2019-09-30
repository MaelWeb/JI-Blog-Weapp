import { Host } from '@Config/index';
import Request from '@Utils/request';
import _Towxml from '@Utils/towxml/main';
import { getOffsetInfo } from '@Utils/util';

// pages/article/article.js
const Towxml = new _Towxml();
type ResData = {
    [key: string]: any
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: false,
        titleConfig: {
            bgColor: 'transparent',
            iconColor: '#fff',
            title: '',
        },
        banner: '',
        date: '',
        title: '',
        htmlContent: '',
        tags: [],
    },
    options: {
        id: '',
    },
    layoutMarginTop: 0,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options: { id: string; }) {
        this.options = options;
    },
    onReady() {
        getOffsetInfo('.article-layout')
            .then((dom: ResData): void | PromiseLike<void> => {
                this.layoutMarginTop = dom.top
            })
    },
    onPageScroll(option: { scrollTop: number }) {
        const { titleConfig } = this.data
        if (option.scrollTop > this.layoutMarginTop && !titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: this.data.title,
                },
            })
        } else if (option.scrollTop < this.layoutMarginTop && titleConfig.title) {
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
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getArticle();
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
            title: `${this.data.article.title} - 「JI · 记小栈」`,
            path: `/pages/article/articlei?id=${this.options.id}`,
            imageUrl: this.data.article && this.data.article.banner ? this.data.article.banner : "https://cdn.liayal.com/article/article_default_banner.jpg"
        }
    },
    getArticle() {
        // wx.showLoading({
        //     title: '加载中....',
        //     mask: true
        // });
        this.setData!({
            showLoading: true,
        })
        Request.get(`${Host}/get/article/${this.options.id}`, {
            params: {
                filter: "weapp"
            }
        }).then((res: ResData) => {
            let article = res.article;
            const { title, content, createTime, banner, tags = [] } = article
            const htmlContent = Towxml.toJson(content, 'markdown');
            const date = this.formatTime(createTime);

            this.setData!({
                banner,
                date,
                title,
                htmlContent,
                tags,
            }, this.hideLoading);
        })

        Request.get(`${Host}/get/comments`, {
            params: {
                articleid: this.options.id
            }
        }).then((res: ResData) => {
            this.setData!({
                comments: res.comments
            })
        })
    },
    hideLoading() {
        this.setData!({
            showLoading: false,
        })
    },
    formatTime(time: number) {
        const date = new Date(time)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        return `${year}年${month}月${day}日`;
    }
})