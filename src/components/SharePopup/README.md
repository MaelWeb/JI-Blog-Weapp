# SharePopup 分享弹窗

## 使用

在页面 `json` 中引入按钮组件：

```json
// import in `page.json`:
"usingComponents": {
  "c-share-popup": "path/to/your/components/SharePopup/share-popup"
}
```

在页面使用
```html
<!-- use in `page.wxml` -->
<c-share-popup />
```

## 代码演示

### 基础用法
```html
<c-share-popup
    show="{{ isShowShare }}"
    share-card-json="{{shareCardJson}}"
    is-show-share-card="{{isShowShareCard}}"
    bind:tapShareCard="creatShareCard"
/>
```

```js
import shareCardJson from './test-card'
Page({
    data: {
        isShowShare: false,
        isShowShareCard: false,
        shareCardJson,
    },
    onShareAppMessage(): object {
        return {
            title: '分享卡片',
            path: '/pages/sharecard/sharecard',
            imageUrl: 'https://image.yonghuivip.com/product/F-CB31371579/158357554151611086262e638f54a1576e935c71c1ef449ec3012.jpg'
        }
    },

    showShare() {
        this.setData!!({
            isShowShare: true,
        })
    },

    creatShareCard() {
        console.log('creatShareCard')
        this.setData!!({
            isShowShareCard: true
        })
    }
})
```


## API
API说明。

| 属性 | 说明 | 类型 | 默认值 |
|-----------|-----------|-----------|-------------|
| show | 是否展示弹窗 | `boolean` | `false` |
| auto-close | 是否自动关闭弹窗 | `boolean` | `true` |
| share-card-json | 生成分享卡片的 Json 对象, 具体查看`ShareCard` 组件 | `object` | `{}` |
| is-show-share-card | 是否展示分享卡片 | `boolean` | `false` |
| tapShareCard | 点击`生成卡片分享`事件 | `function()` | - |
| tapShareFriend | 点击 `微信好友` 事件 | `function()` | - |
| shareCardCancel | 卡片保存点击 `取消` 事件 | `function()` | - |
| saveCardSuccess | 卡片保存点击 `保存到相册` 事件 | `function()` | - |
| sharePopupClose | 关闭分享弹窗 | `function()` | - |



