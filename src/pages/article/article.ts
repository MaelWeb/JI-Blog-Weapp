import { Host } from "@Config/index";
import Request from "@Utils/request";
import { rpxTopx, arrayChunk } from "@Utils/util";
import comi from './comi/comi'

// pages/article/article.js
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
		node: "root",
		theme: "light",
		child: [],
		tags: [],
		$titleBarHeight: 44,
		loadMore: false,		
	},
	options: {
		id: "",
	},
	_wxml: [],
	page: 0,
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
	__bind_tap(event: event) {
		const href = event.currentTarget.dataset.url;
		if (href) {
			this.navigateTo(href);
		}
	},
	navigateTo(href: string) {
		const site = "https://www.liayal.com/article/";
		if (href.indexOf(site) !== -1) {
			wx.navigateTo({
				url: `/pages/article/article?id=${href.split(site)[1]}`,
			});
		} else {
			wx.showToast({
				icon: "none",
				title: "站外链接暂不支持，请至【JI-记小栈】网页版查看",
				duration: 3000,
			});
		}
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
			const { title, createTime, banner = "", tags = [], content = '' } = article;
			comi(content, this)
			this._wxml = arrayChunk(wxml.child, 40);
			const date = this.formatTime(createTime);
			this.setData!(
				{
					banner,
					date,
					title,
					tags,
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
		// if (
		// 	this.data.showLoading ||
		// 	this.data.loadMore ||
		// 	this.page >= this._wxml.length
		// )
		// 	return;
		// this.setData!({
		// 	loadMore: true,
		// });

		// this.getNextPage();
	},
	getNextPage() {
		this.page++;
		const childKey = `child[${this.page}]`;
		const nodeKey = `nodeMap[${this.page}]`;
		this.setData!(
			{
				[childKey]: this.page,
				[nodeKey]: this._wxml[this.page],
			},
			() => {
				this.setData!({
					loadMore: false,
				});
			}
		);
	},
});
