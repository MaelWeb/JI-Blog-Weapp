
Component({
	options: {
		styleIsolation: 'apply-shared'
	},
	properties: {
		nodes: {
			type: Object,
			value: {}
		}
	},
	methods: {
        _tap(event) {
            console.log(event)
            const { href } = event.currentTarget.dataset.data.attr;
            if (href) {
                this.navigateTo(href);
            }
        },
        navigateTo(href) {
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
    }
})