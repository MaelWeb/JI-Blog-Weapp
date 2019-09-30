// pages/about/about.js
Page({
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
      return {
            title: '「JI · 记小栈」- 关于',
            path: '/pages/about/about',
            // imageUrl: "https://cdn.liayal.com/image/about_banner2.jpg"
        }
  }
})