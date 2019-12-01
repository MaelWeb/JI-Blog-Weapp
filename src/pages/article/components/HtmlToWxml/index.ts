import ArticeWxml from '../../articeWxml'
Component({
    properties: {
        index: {
            type: Number,
            value: null,
            observer(newVal) {
                if (newVal >= 0) {
                    this.setData({
                        wxms: ArticeWxml.getWxmlData(newVal)
                    }, this.componentDidUpdate)
                }
            }
        }
    },
    options: {
        styleIsolation: 'shared',
    },
    data: {
        wxms: []
    },
    methods: {
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
        componentDidUpdate() {
            this.triggerEvent('componentDidUpdate')
        }
    }
})