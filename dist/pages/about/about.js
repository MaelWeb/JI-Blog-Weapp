"use strict";
Page({
    data: {
        titleConfig: {
            title: '关于'
        }
    },
    onShareAppMessage: function () {
        return {
            title: '「JI · 记小栈」- 关于',
            path: '/pages/about/about',
        };
    }
});
