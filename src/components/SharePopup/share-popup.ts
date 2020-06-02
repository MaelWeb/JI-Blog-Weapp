Component({

    properties: {
        show: {
            type: Boolean,
            value: false,
        },
        autoClose: {
            type: Boolean,
            value: true,
        },
        isShowShareCard: {
            type: Boolean,
            value: false,
        },
        shareCardJson: {
            type: Object,
            value: {
                background: 'https://static.yonghuivip.com/wechatapp/static/images/share_card_bg.png',
                width: `${750 * 0.7}rpx`,
                height: `${1140 * 0.7}rpx`,
            }
        }
    },
    methods: {
        close() {
            this.data.autoClose && this.setData({
                show: false,
            })
        },
        // 这里是一个自定义方法
        createShareCard() {
            this.triggerEvent('tapShareCard')
            this.close()
        },
        shareToFriend() {
            this.triggerEvent('tapShareFriend')
            this.close()
        },
        saveCardCancel() {
            this.setData({
                isShowShareCard: false,
            })
            this.triggerEvent('shareCardCancel')
        },
        // 卡片生成成功
        onShareCardSuccess(path: string) {
            this.shareCardPath = path
        },
        // 卡片保存成功
        onCardSaveSuccess() {
            this.setData({
                isShowShareCard: false,
            })
            wx.showToast({
                title: '保存成功',
                icon: 'none',
                duration: 2000,
            })
            this.triggerEvent('saveCardSuccess')
        },
        closePopup() {
            this.triggerEvent('sharePopupClose')
            this.close()
        }
    },

})
