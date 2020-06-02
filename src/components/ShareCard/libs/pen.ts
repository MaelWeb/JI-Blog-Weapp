import * as Utils from '../../../utils/util'
import GD from './gradient'

export interface IView {
    type: string;
    css: any;
    sWidth: number;
    sHeight: number;
    text?: string;
    cssStr?: string;
    url?: string;
}

export default class Pen {
    constructor(ctx: wx.CanvasContext, data: object) {
        this.ctx = ctx
        this.data = data
        this.style = {}
    }

    ctx: wx.CanvasContext;
    data: {
        [key: string]: any;
    };
    style: { [key: string]: any };

    paint(callback: Function) {
        this.style = {
            width: Utils.rpxToPx(this.data.width),
            height: Utils.rpxToPx(this.data.height),
        }
        this._background()
        Object.keys(this.data.views).forEach((key) => {
            this._drawAbsolute(this.data.views[key])
        })
        this.ctx.draw(false, () => {
            callback()
        })
    }

    _background() {
        this.ctx.save()
        const { width, height } = this.style
        const bg = this.data.background
        this.ctx.translate(width / 2, height / 2)

        this._doClip(this.data.borderRadius, width, height)
        if (!bg) {
            // 如果未设置背景，则默认使用白色
            this.ctx.setFillStyle('#fff')
            this.ctx.fillRect(-(width / 2), -(height / 2), width, height)
        } else if (
            bg.startsWith('#') ||
            bg.startsWith('rgba') ||
            bg.toLowerCase() === 'transparent'
        ) {
            // 背景填充颜色
            this.ctx.setFillStyle(bg)
            this.ctx.fillRect(-(width / 2), -(height / 2), width, height)
        } else if (GD.api.isGradient(bg)) {
            GD.api.doGradient(bg, width, height, this.ctx)
        } else {
            // 背景填充图片
            // @ts-ignore
            this.ctx.drawImage(bg, -(width / 2), -(height / 2), width, height)
        }
        this.ctx.restore()
    }

    _drawAbsolute(view: IView) {
        // 证明 css 为数组形式，需要合并
        if (view.css && view.css.length) {
            //@ts-ignore
            view.css = Object.assign(...view.css)
        }
        switch (view.type) {
        case 'image':
            this._drawAbsImage(view)
            break
        case 'text':
            this._fillAbsText(view)
            break
        case 'rect':
            this._drawAbsRect(view)
            break
        default:
            break
        }
    }

    /**
     * 根据 borderRadius 进行裁减
     */
    _doClip(
        borderRadius: string,
        width: number,
        height: number,
        align?: string
    ) {
        if (borderRadius && width && height) {
            const r = Math.min(
                Utils.rpxToPx(borderRadius),
                width / 2,
                height / 2
            )
            // 防止在某些机型上周边有黑框现象，此处如果直接设置 setFillStyle 为透明，在 Android 机型上会导致被裁减的图片也变为透明， iOS 和 IDE 上不会
            // setGlobalAlpha 在 1.9.90 起支持，低版本下无效，但把 setFillStyle 设为了 white，相对默认的 black 要好点
            this.ctx.setGlobalAlpha(0)
            this.ctx.setFillStyle('white')
            this.ctx.beginPath()
            const x = this._getXPoint(align, width)

            this.ctx.arc(x + r, -height / 2 + r, r, 1 * Math.PI, 1.5 * Math.PI)
            this.ctx.lineTo(x - r + width, -height / 2)
            this.ctx.arc(
                x - r + width,
                -height / 2 + r,
                r,
                1.5 * Math.PI,
                2 * Math.PI
            )
            this.ctx.lineTo(x - r + width, height / 2 - r)
            this.ctx.arc(x + width - r, height / 2 - r, r, 0, 0.5 * Math.PI)
            this.ctx.lineTo(x + r, height / 2)
            this.ctx.arc(x + r, height / 2 - r, r, 0.5 * Math.PI, 1 * Math.PI)

            this.ctx.closePath()
            this.ctx.fill()
            // 在 ios 的 6.6.6 版本上 clip 有 bug，禁掉此类型上的 clip，也就意味着，在此版本微信的 ios 设备下无法使用 border 属性
            if (
                !(
                    wx.getSystemInfoSync() &&
                    wx.getSystemInfoSync().version <= '6.6.6' &&
                    wx.getSystemInfoSync().platform === 'ios'
                )
            ) {
                this.ctx.clip()
            }
            this.ctx.setGlobalAlpha(1)
        }
    }

    /**
     * 画边框
     */
    _doBorder(view: IView, width: number, height: number) {
        if (!view.css) {
            return
        }
        const { borderRadius, borderWidth, borderColor } = view.css
        if (!borderWidth) {
            return
        }
        this.ctx.save()
        this._preProcess(view, true)
        let r
        if (borderRadius) {
            r = Math.min(Utils.rpxToPx(borderRadius), width / 2, height / 2)
        } else {
            r = 0
        }
        const lineWidth = Utils.rpxToPx(borderWidth)
        this.ctx.setLineWidth(lineWidth)
        this.ctx.setStrokeStyle(borderColor || 'black')
        this.ctx.beginPath()

        const x = this._getXPoint(view.css.align, width)

        console.log('_doBorder', x, r)

        this.ctx.arc(
            x + r,
            -height / 2 + r,
            r + lineWidth / 2,
            1 * Math.PI,
            1.5 * Math.PI
        )
        this.ctx.lineTo(x - r + width, -height / 2 - lineWidth / 2)
        this.ctx.arc(
            x - r + width,
            -height / 2 + r,
            r + lineWidth / 2,
            1.5 * Math.PI,
            2 * Math.PI
        )
        this.ctx.lineTo(x + width + lineWidth / 2, height / 2 - r)
        this.ctx.arc(
            x + width - r,
            height / 2 - r,
            r + lineWidth / 2,
            0,
            0.5 * Math.PI
        )
        this.ctx.lineTo(x + r, height / 2 + lineWidth / 2)
        this.ctx.arc(
            x + r,
            height / 2 - r,
            r + lineWidth / 2,
            0.5 * Math.PI,
            1 * Math.PI
        )

        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.restore()
    }

    _measureText(text: string, fontSize = 10) {
        if (this.ctx.measureText) return this.ctx.measureText(text)

        text = String(text)
        const _text = text.split('')
        let width = 0
        _text.forEach((item) => {
            if (/[a-zA-Z]/.test(item)) {
                width += 7
            } else if (/[0-9]/.test(item)) {
                width += 5.5
            } else if (/\./.test(item)) {
                width += 2.7
            } else if (/-/.test(item)) {
                width += 3.25
            } else if (/[\u4e00-\u9fa5]/.test(item)) {
                // 中文匹配
                width += 10
            } else if (/\(|\)/.test(item)) {
                width += 3.73
            } else if (/\s/.test(item)) {
                width += 2.5
            } else if (/%/.test(item)) {
                width += 8
            } else {
                width += 10
            }
        })
        return {
            width: (width * fontSize) / 10,
        }
    }

    _preProcess(
        view: IView,
        notClip?: boolean
    ): {
        width: number;
        height: number;
        x: number;
        y: number;
        extra: any;
    } {
        let width
        let height
        let extra
        switch (view.type) {
        case 'text': {
            const fontWeight =
                    view.css.fontWeight === 'bold' ? 'bold' : 'normal'
            view.css.fontSize = view.css.fontSize
                ? view.css.fontSize
                : '20rpx'
            if (
                Utils.compare(
                    wx.getSystemInfoSync().SDKVersion,
                    '2.0.0',
                    '>='
                )
            ) {
                this.ctx.font = `normal ${fontWeight} ${Utils.rpxToPx(
                    view.css.fontSize
                )}px ${
                    view.css.fontFamily ? view.css.fontFamily : 'sans-serif'
                }`
            } else {
                this.ctx.setFontSize(Utils.rpxToPx(view.css.fontSize))
            }
            const textLength = this._measureText(
                    view.text as string,
                    Utils.rpxToPx(view.css.fontSize)
            ).width
            width = view.css.width
                ? Utils.rpxToPx(view.css.width)
                : textLength
                // 计算行数
            const calLines = Math.ceil(textLength / width)
            const lines =
                    view.css.maxLines < calLines ? view.css.maxLines : calLines
            const lineHeight = view.css.lineHeight
                ? Utils.rpxToPx(view.css.lineHeight)
                : Utils.rpxToPx(view.css.fontSize)
            height = lineHeight * lines
            extra = {
                lines,
                lineHeight,
            }
            break
        }
        case 'image': {
            // image 如果未设置长宽，则使用图片本身的长宽
            const ratio = wx.getSystemInfoSync().pixelRatio
                ? wx.getSystemInfoSync().pixelRatio
                : 2
            width =
                    view.css && view.css.width
                        ? Utils.rpxToPx(view.css.width)
                        : Math.round(view.sWidth / ratio)
            height =
                    view.css && view.css.height
                        ? Utils.rpxToPx(view.css.height)
                        : Math.round(view.sHeight / ratio)
            break
        }
        default: {
            if (!(view.css.width && view.css.height)) {
                console.error('You should set width and height')
            }
            width = Utils.rpxToPx(view.css.width || 0)
            height = Utils.rpxToPx(view.css.height || 0)
            break
        }
        }
        const _left =
            view.css && view.css.left ? Utils.rpxToPx(view.css.left, true) : 0
        const x =
            view.css && view.css.right
                ? this.style.width - Utils.rpxToPx(view.css.right, true)
                : _left

        const _top =
            view.css && view.css.top ? Utils.rpxToPx(view.css.top, true) : 0
        const y =
            view.css && view.css.bottom
                ? this.style.height -
                  height -
                  Utils.rpxToPx(view.css.bottom, true)
                : _top

        const angle =
            view.css && view.css.rotate ? this._getAngle(view.css.rotate) : 0
        // 当设置了 right 时，默认 align 用 right，反之用 left
        const _right = view.css && view.css.right ? 'right' : 'left'
        const align = view.css && view.css.align ? view.css.align : _right
        switch (align) {
        case 'center':
            this.ctx.translate(x, y + height / 2)
            break
        case 'right':
            this.ctx.translate(x - width / 2, y + height / 2)
            break
        default:
            this.ctx.translate(x + width / 2, y + height / 2)
            break
        }
        this.ctx.rotate(angle)
        if (!notClip && view.css && view.css.borderRadius) {
            this._doClip(view.css.borderRadius, width, height, align)
        }
        this._doShadow(view)

        return {
            width,
            height,
            x,
            y,
            extra,
        }
    }

    // 画文字的背景图片
    _doBackground(view: IView) {
        this.ctx.save()
        const { width: rawWidth, height: rawHeight } = this._preProcess(
            view,
            true
        )

        const { background, padding } = view.css
        let pd = [0, 0, 0, 0]
        if (padding) {
            const pdg = padding.split(/\s+/)
            if (pdg.length == 1) {
                const x = Utils.rpxToPx(pdg[0])
                pd = [x, x, x, x]
            }
            if (pdg.length == 2) {
                const x = Utils.rpxToPx(pdg[0])
                const y = Utils.rpxToPx(pdg[1])
                pd = [x, y, x, y]
            }
            if (pdg.length == 3) {
                const x = Utils.rpxToPx(pdg[0])
                const y = Utils.rpxToPx(pdg[1])
                const z = Utils.rpxToPx(pdg[2])
                pd = [x, y, z, y]
            }
            if (pdg.length == 4) {
                const x = Utils.rpxToPx(pdg[0])
                const y = Utils.rpxToPx(pdg[1])
                const z = Utils.rpxToPx(pdg[2])
                const a = Utils.rpxToPx(pdg[3])
                pd = [x, y, z, a]
            }
        }
        const width = rawWidth + pd[1] + pd[3]
        const height = rawHeight + pd[0] + pd[2]
        if (GD.api.isGradient(background)) {
            GD.api.doGradient(background, width, height, this.ctx)
        } else {
            this.ctx.setFillStyle(background)
        }
        const x = this._getXPoint(view.css.align, width)
        this.ctx.fillRect(x, -(height / 2), width, height)

        this.ctx.restore()
    }

    _drawAbsImage(view: IView) {
        if (!view.url) {
            return
        }
        this.ctx.save()
        const { width, height } = this._preProcess(view)
        // 获得缩放到图片大小级别的裁减框
        let sWidth = view.sWidth
        let sHeight = view.sHeight
        let startX = 0
        let startY = 0
        // 绘画区域比例
        const cp = width / height
        // 原图比例
        const op = view.sWidth / view.sHeight
        if (cp >= op) {
            sHeight = sWidth / cp
            startY = Math.round((view.sHeight - sHeight) / 2)
        } else {
            sWidth = sHeight * cp
            startX = Math.round((view.sWidth - sWidth) / 2)
        }

        console.log(
            `_drawAbsImage: sx: ${startX}, sy:${startY}, sWidth:${sWidth}, sHeight:${sHeight}, dx:${-(
                width / 2
            )}, dy:${-(height / 2)}, dWidth: ${width}, dHeight:${height}`
        )

        if (view.css && view.css.mode === 'scaleToFill') {
            // @ts-ignore
            this.ctx.drawImage(
                view.url,
                -(width / 2),
                -(height / 2),
                width,
                height
            )
        } else {
            const gifReg = /\.gif$/
            gifReg.test(view.url)
            // @ts-ignore
                ? this.ctx.drawImage(
                    view.url,
                    -(width / 2),
                    -(height / 2),
                    width,
                    height
                )
                : this.ctx.drawImage(
                    view.url,
                    startX,
                    startY,
                    sWidth,
                    sHeight,
                    -(width / 2),
                    -(height / 2),
                    width,
                    height
                )
        }
        this.ctx.restore()
        this._doBorder(view, width, height)
    }

    _fillAbsText(view: IView) {
        if (!view.text) {
            return
        }
        if (view.css.background) {
            // 生成背景
            this._doBackground(view)
        }
        this.ctx.save()
        const { width, height, extra } = this._preProcess(view)

        this.ctx.setFillStyle(view.css.color || 'black')
        const { lines, lineHeight } = extra
        const preLineLength = Math.round(view.text.length / lines)
        let start = 0
        let alreadyCount = 0
        for (let i = 0; i < lines; ++i) {
            alreadyCount = preLineLength
            let text = view.text.substr(start, alreadyCount)
            let measuredWith = this._measureText(text).width
            // 如果测量大小小于width一个字符的大小，则进行补齐，如果测量大小超出 width，则进行减除
            // 如果已经到文本末尾，也不要进行该循环
            while (
                start + alreadyCount <= view.text.length &&
                (width - measuredWith > Utils.rpxToPx(view.css.fontSize) ||
                    measuredWith > width)
            ) {
                if (measuredWith < width) {
                    text = view.text.substr(start, ++alreadyCount)
                } else {
                    if (text.length <= 1) {
                        // 如果只有一个字符时，直接跳出循环
                        break
                    }
                    text = view.text.substr(start, --alreadyCount)
                }
                measuredWith = this._measureText(text).width
            }
            start += text.length
            // 如果是最后一行了，发现还有未绘制完的内容，则加...
            if (i === lines - 1 && start < view.text.length) {
                while (this._measureText(`${text}...`).width > width) {
                    if (text.length <= 1) {
                        // 如果只有一个字符时，直接跳出循环
                        break
                    }
                    text = text.substring(0, text.length - 1)
                }
                text += '...'
                measuredWith = this._measureText(text).width
            }
            this.ctx.setTextAlign(view.css.align ? view.css.align : 'left')
            let x
            switch (view.css.align) {
            case 'center':
                x = width / 2
                break
            case 'right':
                x = 1.5 * width
                break
            default:
                x = -(width / 2)
                break
            }
            const y =
                -(height / 2) +
                (i === 0
                    ? Utils.rpxToPx(view.css.fontSize)
                    : Utils.rpxToPx(view.css.fontSize) + i * lineHeight)
            if (view.css.textStyle === 'stroke') {
                this.ctx.strokeText(text, x, y, measuredWith)
            } else {
                this.ctx.fillText(text, x, y, measuredWith)
            }
            const fontSize = Utils.rpxToPx(view.css.fontSize)
            if (view.css.textDecoration) {
                this.ctx.beginPath()
                if (/\bunderline\b/.test(view.css.textDecoration)) {
                    this.ctx.moveTo(x, y)
                    this.ctx.lineTo(x + measuredWith, y)
                }
                if (/\boverline\b/.test(view.css.textDecoration)) {
                    this.ctx.moveTo(x, y - fontSize)
                    this.ctx.lineTo(x + measuredWith, y - fontSize)
                }
                if (/\bline-through\b/.test(view.css.textDecoration)) {
                    this.ctx.moveTo(x, y - fontSize / 3)
                    this.ctx.lineTo(x + measuredWith, y - fontSize / 3)
                }
                this.ctx.closePath()
                this.ctx.setStrokeStyle(view.css.color)
                this.ctx.stroke()
            }
        }

        this.ctx.restore()
        this._doBorder(view, width, height)
    }

    _getXPoint(align: string | undefined, width: number) {
        let x
        switch (align) {
        case 'center':
            x = 0
            break
        case 'right':
            x = width / 2
            break
        default:
            x = -(width / 2)
            break
        }

        return x
    }

    _drawAbsRect(view: IView) {
        this.ctx.save()
        const { width, height } = this._preProcess(view)
        if (GD.api.isGradient(view.css.color)) {
            GD.api.doGradient(view.css.color, width, height, this.ctx)
        } else {
            this.ctx.setFillStyle(view.css.color)
        }
        this.ctx.fillRect(-(width / 2), -(height / 2), width, height)
        this.ctx.restore()
        this._doBorder(view, width, height)
    }

    // shadow 支持 (x, y, blur, color), 不支持 spread
    // shadow:0px 0px 10px rgba(0,0,0,0.1);
    _doShadow(view: IView) {
        if (!view.css || !view.css.shadow) {
            return
        }
        const box = view.css.shadow.replace(/,\s+/g, ',').split(' ')
        if (box.length > 4) {
            console.error('shadow don\'t spread option')
            return
        }
        this.ctx.shadowOffsetX = parseInt(box[0], 10)
        this.ctx.shadowOffsetY = parseInt(box[1], 10)
        this.ctx.shadowBlur = parseInt(box[2], 10)
        this.ctx.shadowColor = box[3]
    }

    _getAngle(angle: string | number) {
        return (Number(angle) * Math.PI) / 180
    }
}
