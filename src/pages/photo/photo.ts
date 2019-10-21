import Request from '@Utils/request';
import { Host } from '@Config/index';
import * as Utils from '@Utils/util';
//获取应用实例
// pages/photo/photo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        photos: [{}],
        photoUrls: [''],
        page: 1,
        allPage: 1,
        titleConfig: {
            bgColor: 'transparent',
            iconColor: '#fff',
            title: '',
        },
        showLoading: false,
    },
    bannerHeight: Utils.rpxTopx(500),
    isloading: false,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.setData!({
            showLoading: true,
        })
        this.isloading = true
        this.getPhotos(1);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if ((this.data.page < this.data.allPage) && !this.isloading) {
            this.getPhotos(this.data.page + 1);
        }
    },
    onPageScroll(option: { scrollTop: number }) {
        const { titleConfig } = this.data
        if (option.scrollTop > this.bannerHeight && !titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '图记',
                },
            })
        } else if (option.scrollTop < this.bannerHeight && titleConfig.title) {
            this.setData!({
                titleConfig: {
                    bgColor: 'transparent',
                    iconColor: '#fff',
                    title: '',
                },
            })
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '「JI · 记小栈」- 图记',
            path: '/pages/photo/photo',
            // imageUrl: this.data.photos[0] ? this.data.photos[0].src : 'https://cdn.liayal.com/14506926.jpg'
        }
    },
    getPhotos(page = 1) {
        Request.get(`${Host}/get/photos`, { params: { page } })
            .then((res: ResData) => {
                let photoUrls: string[] = [];
                let photos: Object[] = [];
                let baseHeight = 100;

                res.photos.map((photo: { key: string; width: number; w: number; height: number; }, ) => {
                    console.log(photo)
                    const src = `https://cdn.liayal.com/${photo.key}`
                    photoUrls.push(src);
                    photos.push({
                        ...photo,
                        src,
                        w: photo.width * baseHeight / photo.height,
                        paddingTop: photo.height / photo.width * 100
                    });
                });
                this.setData!({
                    page,
                    photos: page == 1 ? photos : this.data.photos.concat(photos),
                    photoUrls: page == 1 ? photoUrls : this.data.photoUrls.concat(photoUrls),
                    allPage: res.allPage
                }, () => {
                    this.setData!({
                        showLoading: false,
                    })
                    wx.stopPullDownRefresh();
                    this.isloading = false
                });
            })
    },
    previewImage(event: event) {
        const { photoUrls } = this.data
        const _urls = [...photoUrls]
        let src = event.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: _urls.slice(1),
        });
    },
})