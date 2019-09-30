import CommonBehaviors from '../Behaviors/component_bhv';
const APP = getApp();
const sysinfo = APP.globalData.SystemInfo;
Component({
    behaviors: [CommonBehaviors],
    properties: {
        src: {
            type: String,
            value: '',
            observer(newVal, oldVal) {
                if (!newVal) {
                    this.setData({
                        _src: '',
                    });
                }
                else if (newVal && newVal !== oldVal) {
                    this.isReady && this.setUrl();
                }
            },
        },
        bgImg: {
            type: String,
            value: 'https://cdn.liayal.com/image/img_loading.gif',
        },
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
        width: {
            type: Number,
            value: 0,
        },
        height: {
            type: Number,
            value: 0,
        },
        aspect: {
            type: Number,
            value: null,
        },
    },
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
    methods: {
        isAndroid() {
            return /android/i.test(sysinfo.system);
        },
        setUrl() {
            if (!/^(http|https)./g.test(this.data.src)) {
                console.error(`[Image Component] ${this.data.src} 图片路径有误！本地图片请使用原生 <image> 组件`);
                return;
            }
            const { pixelRatio, } = sysinfo;
            const fileExt = this.getFileExt();
            const _format = this.isAndroid() && fileExt != 'gif' ? 'webp' : fileExt;
            this.getOffsetInfo('.components-image').then((res) => {
                let _width = 0;
                if (!res || res.width === 0)
                    return this.setData({
                        lazyLoad: false,
                        _src: this.data.src,
                    });
                _width = pixelRatio > 2 ? res.width * 2 : res.width * pixelRatio;
                let _style = '';
                if (this.data.aspect && res.width) {
                    _style = `height:${res.width * this.data.aspect}px`;
                }
                this.setData({
                    lazyLoad: res.top > sysinfo.windowHeight,
                    _style,
                    _src: `${this.data.src.split('?')[0]}?${`imageMogr2/auto-orient/thumbnail/${_width}x/strip/format/${_format}/interlace/1/quality/90/size-limit/300k!`}`,
                });
            });
        },
        getFileExt() {
            const fileUrl = this.data.src.split('?')[0];
            const splitUlr = fileUrl.split('/');
            const filepath = splitUlr[splitUlr.length - 1];
            const ext = /[^.]+$/.exec(filepath) || [];
            return /[.]/.exec(filepath) ? ext[0] : 'jpg';
        },
        onLoad(event) {
            this.setData({
                hideMini: true,
                _style: '',
            });
            this.triggerEvent('load', Object.assign({}, event.detail));
        },
        onLoadError() {
            this.setData({
                _src: this.data.src,
            });
        },
        onPreLoad() {
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
