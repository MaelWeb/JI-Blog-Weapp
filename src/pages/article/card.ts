function getCardJson({
    banner,
    title = "记小栈",
    code,
}: {
    banner?: string;
    title?: string;
    code?: string;
}) {
    return {
        width: "525rpx",
        height: "750rpx",
        views: [
            {
                type: "image",
                url: banner,
                css: {
                    top: "0",
                    left: "0",
                    width: "525rpx",
                    height: "525rpx",
                },
            },
            {
                type: "text",
                text: title,
                css: {
                    fontSize: "22.4rpx",
                    top: "551.4rpx",
                    lineHeight: "30rpx",
                    left: "42rpx",
                    width: "273rpx",
                    align: "left",
                    color: "#333333",
                    maxLines: 2,
                },
            },
            {
                type: "image",
                url: code,
                css: {
                    bottom: "85rpx",
                    right: "43.4rpx",
                    width: "112rpx",
                    height: "112rpx",
                },
            },
            {
                type: "text",
                text: "(长按扫码查看)",
                css: {
                    bottom: "45rpx",
                    left: "369.59999999999997rpx",
                    width: "112rpx",
                    height: "14rpx",
                    align: "center",
                    color: "#333",
                    fontSize: "14rpx",
                },
            },
            {
                type: "text",
                text: "游走在技术与艺术的边缘，偶是一枚前端攻城狮",
                css: {
                    bottom: "20rpx",
                    left: "25rpx",
                    width: "500rpx",
                    height: "14rpx",
                    align: "left",
                    color: "#ccc",
                    fontSize: "14rpx",
                }
            },
        ],
    };
}

export default getCardJson;
