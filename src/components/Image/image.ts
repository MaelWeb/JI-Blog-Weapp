import CommonBehaviors from '../Behaviors/component_bhv'
/** *
 * 图片组件
 *
 *
 */
const APP = getApp();
const sysinfo = APP.globalData.SystemInfo;
Component({
    behaviors: [CommonBehaviors],
    /**
     * 组件的属性列表
     */
    properties: {
        /**
         * 图片资源地
         *
         * */
        src: {
            type: String,
            value: '',
            observer(newVal, oldVal) {
                if (!newVal) {
                    this.setData!({
                        _src: '',
                    });
                } else if (newVal && newVal !== oldVal) {
                    this.isReady && this.setUrl();
                }
            },
        },
        // 背景图
        bgImg: {
            type: String,
            value: 'https://cdn.liayal.com/image/img_loading.gif',
        },
        /**
         * 图片裁剪、缩放的模式, 同步原生组件
         *
         * */
        mode: {
            type: String,
            value: 'scaleToFill',
        },

        style: {
            type: String,
            value: '',
        },

        hidden: {
            type: Boolean,
            value: false,
        },
        /**
         * 图片的原始宽高
         *
         * */
        width: {
            type: Number,
            value: 0,
        },

        height: {
            type: Number,
            value: 0,
        },
        /**
         * 原图片的【高/宽】比
         */
        aspect: {
            type: Number,
            value: null,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        _src: '',
        _style: {},
        hideMini: false,
        lazyLoad: false,
    },

    externalClasses: ['class', 'exclass'],
    options: {
        addGlobalClass: false,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        isAndroid() {
            return /android/i.test(sysinfo.system);
        },
        /**
         * 获取七牛的图片处理器
         * 参考 https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
         *
         * */
        setUrl(): void {
            if (!/^(http|https)./g.test(this.data.src)) {
                console.error(
                    `[Image Component] ${this.data.src} 图片路径有误！本地图片请使用原生 <image> 组件`,
                );

                return
            }
            const {
                pixelRatio,
            } = sysinfo;
            const fileExt = this.getFileExt();
            const _format = this.isAndroid() && fileExt != 'gif' ? 'webp' : fileExt; // 安卓使用webp

            this.getOffsetInfo('.components-image').then((res: {width: number, top: number}) => {
                // 根据节点获取加载图片的大小
                let _width = 0;
                if (!res || res.width === 0) return this.setData({
                    lazyLoad: false,
                    _src: this.data.src,
                });
                // if (fileExt === 'gif') {
                //     // gif
                //     _width = res.width * 1.5;
                // } else {
                    // 其他图片至多3倍
                _width = pixelRatio > 2 ? res.width * 2 : res.width * pixelRatio;
                // }
                let _style = '';
                if (this.data.aspect && res.width) {
                    _style = `height:${res.width * this.data.aspect}px`;
                }
                this.setData({
                    lazyLoad: res.top > sysinfo.windowHeight,
                    _style,
                    _src: `${
                        this.data.src.split('?')[0]
                    }?${`imageMogr2/auto-orient/thumbnail/${_width}x/strip/format/${_format}/interlace/1/quality/90/size-limit/300k!`}`,
                });
            });
        },

        getFileExt() {
            const fileUrl = this.data.src.split('?')[0];

            const splitUlr = fileUrl.split('/');

            const filepath = splitUlr[splitUlr.length - 1];
            const ext = /[^.]+$/.exec(filepath) || []

            return /[.]/.exec(filepath) ? ext[0] : 'jpg';
        },

        onLoad(event: event) {
            // 原图加载完成
            this.setData({
                hideMini: true,
                _style: '',
            });
            this.triggerEvent('load', {...event.detail});
        },

        onLoadError() {
            this.setData({
                _src: this.data.src,
            });
        },

        onPreLoad() {
            // this.setUrl();
        },
    },

    ready() {
        this.isReady = true;
        this.data.src && this.setUrl();
    },

    detached() {
        this.setData({
            _src: '',
            src: '',
        });
    },
});