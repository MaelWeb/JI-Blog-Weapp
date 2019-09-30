import { Host } from '../../config/index';
import Request from '../../utils/request';
import _Towxml from '../../utils/towxml/main';
import { getOffsetInfo } from '../../utils/util';
const Towxml = new _Towxml();
Page({
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
    onLoad(options) {
        this.options = options;
    },
    onReady() {
        getOffsetInfo('.article-layout')
            .then((dom) => {
            this.layoutMarginTop = dom.top;
        });
    },
    onPageScroll(option) {
        const { titleConfig } = this.data;
        if (option.scrollTop > this.layoutMarginTop && !titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: this.data.title,
                },
            });
        }
        else if (option.scrollTop < this.layoutMarginTop && titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: 'transparent',
                    iconColor: '#fff',
                    title: '',
                },
            });
        }
    },
    onShow() {
        this.getArticle();
    },
    onPullDownRefresh() {
        this.getArticle();
    },
    onShareAppMessage() {
        return {
            title: `${this.data.article.title} - 「JI · 记小栈」`,
            path: `/pages/article/articlei?id=${this.options.id}`,
            imageUrl: this.data.article && this.data.article.banner ? this.data.article.banner : "https://cdn.liayal.com/article/article_default_banner.jpg"
        };
    },
    getArticle() {
        this.setData({
            showLoading: true,
        });
        Request.get(`${Host}/get/article/${this.options.id}`, {
            params: {
                filter: "weapp"
            }
        }).then((res) => {
            let article = res.article;
            const { title, content, createTime, banner, tags = [] } = article;
            const htmlContent = Towxml.toJson(content, 'markdown');
            const date = this.formatTime(createTime);
            this.setData({
                banner,
                date,
                title,
                htmlContent,
                tags,
            }, this.hideLoading);
        });
        Request.get(`${Host}/get/comments`, {
            params: {
                articleid: this.options.id
            }
        }).then((res) => {
            this.setData({
                comments: res.comments
            });
        });
    },
    hideLoading() {
        this.setData({
            showLoading: false,
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
