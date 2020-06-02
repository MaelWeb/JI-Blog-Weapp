import Downloader from './libs/downloader'
import * as Utils from '../../utils/util'
import Pen, { IView } from './libs/pen'

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        width: {
            type: String,
            value: '525rpx'
        },
        height: {
            type: String,
            value: '750rpx'
        },
        palette: {
            type: Object,
            value: {},
            observer(newVal: object, oldVal: object) {
                if (this.isNeedRefresh(newVal, oldVal)) {
                    this.paintCount = 0
                    console.log('palette', newVal)
                    // this.cssToStr();
                    this.startPaint()
                }
            },
        },
        // 启用脏检查，默认 false
        dirty: {
            type: Boolean,
            value: true,
        },
        // 是否展示
        isShow: {
            type: Boolean,
            value: false,
            observer(newVal, oldVal) {
                if (newVal && (newVal !== oldVal)) {
                    this.paintCount = 0
                    // this.cssToStr();
                    this.startPaint()
                }
            },
        },
    },

    data: {
        picURL: '',
        _style: '',
        loadViews: [],
        writePhotosAlbumAuth: false,
        _isShow: false,
    },

    detached() { },

    created() {
        this.canvasWidthInPx = 0
        this.canvasHeightInPx = 0
        this.paintCount = 0
    },

    methods: {
        /**
         * 判断一个 object 是否为 空
         * @param {object} object
         */
        isEmpty(object) {
            const keysLength = Object.keys(object).length
            return !keysLength
        },

        isNeedRefresh(newVal, oldVal) {
            if (!newVal || this.isEmpty(newVal) || (this.data.dirty && Utils.deepEqual(newVal, oldVal))) {
                return false
            }
            return true
        },

        startPaint() {
            const _palette = this.data.palette
            if (!this.data.isShow || this.isEmpty(_palette) || !this.isNeedRefresh(_palette, this.oldPalette)) {
                return
            }

            wx.showLoading({
                title: '卡片生成中...',
                mask: true,
            })
            this.setData({
                painterStyle: `width:${_palette.width};height:${_palette.height};`,
                btnStyle: `width:${_palette.width};`,
                isShowBg: true,
            })
            this.downloadImages().then((palette: { width: string; height: string }) => {
                const {
                    width,
                    height
                } = palette
                this.canvasWidthInPx = Utils.rpxToPx(width)
                this.canvasHeightInPx = Utils.rpxToPx(height)
                if (!width || !height) {
                    console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`)
                    return
                }
                if (width !== _palette.width) {
                    this.setData({
                        painterStyle: `width:${width};height:${height};`,
                        btnStyle: `width:${width};`,
                    })
                }


                if (!_palette.views) return
                this.oldPalette = palette
                const ctx = wx.createCanvasContext('cardCanvas', this)
                // ctx.scale(0.7, 0.7);
                // ctx.translate(systemInfo.screenWidth / 2 - this.canvasWidthInPx * 0.3, systemInfo.screenHeight / 2 - this.canvasHeightInPx * 0.35);
                const pen = new Pen(ctx, palette)
                pen.paint(() => {
                    this.saveImgToLocal()
                })
            })
        },


        cssToStr() {
            if (this.isEmpty(this.data.palette)) {
                return
            }

            const loadViews: { type: string; cssStr: string }[] = []

            const {
                views
            } = this.data.palette

            views.forEach((view: IView) => {
                let cssStr = ''
                Object.keys(view.css).forEach((key) => {
                    cssStr += `${key}:${view.css[key]};`
                })

                loadViews.push({
                    type: views.type,
                    cssStr,
                })
            })

            this.setData({
                loadViews,
            })
        },

        downloadImages() {
            return new Promise((resolve) => {
                let preCount = 0
                let completeCount = 0
                const paletteCopy = this.data.palette
                if (paletteCopy.background) {
                    preCount++
                    Downloader.download(paletteCopy.background, true).then((path) => {
                        paletteCopy.background = path
                        this.setData({
                            background: path,
                            isShowBg: true,
                        })
                        completeCount++
                        if (preCount === completeCount) {
                            resolve(paletteCopy)
                        }
                    }, () => {
                        completeCount++
                        if (preCount === completeCount) {
                            resolve(paletteCopy)
                        }
                    })
                }
                if (paletteCopy.views) {
                    Object.keys(paletteCopy.views).forEach((key) => {
                        const view = paletteCopy.views[key]
                        if (view && view.type === 'image' && view.url) {
                            preCount++
                            const src = view.url
                            Downloader.download(view.url, view.saveToLocal).then((path) => {
                                view.url = path
                                wx.getImageInfo({
                                    src: view.url,
                                    success: (res) => {
                                        // 获得一下图片信息，供后续裁减使用
                                        view.sWidth = res.width
                                        view.sHeight = res.height
                                        console.warn(`getImageInfo ${src} success, ${JSON.stringify(res)}`)
                                    },
                                    fail: (error) => {
                                        // 如果图片坏了，则直接置空，防止坑爹的 canvas 画崩溃了
                                        view.url = ''
                                        console.warn(`getImageInfo ${src} failed, ${JSON.stringify(error)}`)
                                    },
                                    complete: () => {
                                        completeCount++
                                        if (preCount === completeCount) {
                                            console.log('callback', paletteCopy)
                                            resolve(paletteCopy)
                                        }
                                    },
                                })
                            }, () => {
                                completeCount++
                                if (preCount === completeCount) {
                                    console.log('callback', paletteCopy)
                                    resolve(paletteCopy)
                                }
                            })
                        }
                    })
                }
                if (preCount === 0) {
                    resolve(paletteCopy)
                }
            })
        },

        saveImgToLocal() {
            setTimeout(() => {
                wx.canvasToTempFilePath({
                    canvasId: 'cardCanvas',
                    quality: 1,
                    success: (res) => {
                        this.getImageInfo(res.tempFilePath)
                    },
                    fail: (error) => {
                        this.triggerEvent('onCardError', {
                            error,
                        })
                    },
                }, this)
            }, 300)
        },

        getImageInfo(filePath) {
            wx.getImageInfo({
                src: filePath,
                success: (infoRes) => {
                    if (this.paintCount > MAX_PAINT_COUNT) {
                        const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`
                        this.triggerEvent('onCardError', {
                            error
                        })
                        return
                    }
                    // 比例相符时才证明绘制成功，否则进行强制重绘制
                    if (Math.abs((infoRes.width * this.canvasHeightInPx - this.canvasWidthInPx * infoRes.height) / (infoRes.height * this.canvasHeightInPx)) < 0.01) {
                        this.triggerEvent('onCardSuccess', {
                            path: filePath,
                        })
                        this.setData({
                            isShowBg: false,
                        })
                    } else {
                        this.startPaint()
                    }
                    this.paintCount++
                },
                fail: (error) => {
                    console.error(`getImageInfo failed, ${JSON.stringify(error)}`)
                    this.triggerEvent('onCardError', {
                        error,
                    })
                },
            })
        },

        savePhoto() {
            wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: () => {
                    this._canvasToPhoto()
                },
                fail: (err) => {
                    wx.showModal({
                        title: '保存失败',
                        content: '需要获取你的【保存到相册】权限',
                        confirmText: '去授权',
                        confirmColor: '#FD7622',
                        success: (res) => {
                            if (res.confirm) {
                                this._openSetting()
                            } else {
                                this.triggerEvent('onCardSaveError', err)
                            }
                        },
                        fail: () => {
                            this.triggerEvent('onCardSaveError', err)
                        },
                    })
                },
            })
        },
        // 打开授权页
        _openSetting() {
            wx.openSetting({
                success: (res) => {
                    const {
                        authSetting,
                    } = res
                    if (authSetting['scope.writePhotosAlbum']) {
                        this._canvasToPhoto()
                    } else {
                        wx.showToast({
                            title: '授权失败',
                            icon: 'none',
                        })
                        this.triggerEvent('onCardSaveError', res)
                    }
                },
                fail: (err) => {
                    wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                    })
                    this.triggerEvent('onCardSaveError', err)
                },
            })
        },
        // 讲cavans转成相片
        _canvasToPhoto() {
            wx.canvasToTempFilePath({
                canvasId: 'cardCanvas',
                quality: 1,
                success: (res) => {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            this.triggerEvent('onCardSaveSuccess')
                        },
                        fail: (err) => {
                            this.triggerEvent('onCardSaveError', err)
                        },
                    })
                },
                fail: (err) => {
                    this.triggerEvent('onCardSaveError', err)
                },
            }, this)
        },

        saveCancel() {
            this.triggerEvent('onCardSaveCancel')
        },
    },
})