import CommonBehaviors from '../Behaviors/component_bhv'

Component({
    behaviors: [CommonBehaviors],
    properties: {
        title: {
            type: String,
            value: '',
        },
        bgColor: {
            type: String,
            value: "#fff",
        },
        iconColor: {
            type: String,
            value: "#000",
        },
        align: {
            type: String,
            value: 'center'
        },
        useSlot: {
            type: Boolean,
            value: false,
        }
    },
    data: {
        statusBarHeight: 0,
    },
    externalClasses: ['ext-class'],
    attached() {
        const APP = getApp();
        const sysinfo = APP.globalData.SystemInfo;
        this.setData({
            statusBarHeight: sysinfo.statusBarHeight,
            showReturn: getCurrentPages().length > 1
        })

    },
    ready() {
    },
    methods: {
        navigateBack() {
            wx.navigateBack({
                delta: 1,
            })
        },
    }
})