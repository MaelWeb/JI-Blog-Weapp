import Request from '../../utils/request';
import { Host } from '../../config/index';
import * as Utils from '../../utils/util';
Page({
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
        $titleBarHeight: 44,
        showLoading: false,
    },
    bannerHeight: Utils.rpxTopx(500),
    isloading: false,
    onLoad: function () {
        this.setData({
            showLoading: true,
        });
        this.isloading = true;
        this.getPhotos(1);
    },
    onReachBottom: function () {
        if ((this.data.page < this.data.allPage) && !this.isloading) {
            this.getPhotos(this.data.page + 1);
        }
    },
    onPageScroll(option) {
        const { titleConfig } = this.data;
        if (option.scrollTop > (this.bannerHeight - this.data.$titleBarHeight) && !titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: '#fff',
                    iconColor: '#000',
                    title: '图记',
                },
            });
        }
        else if (option.scrollTop < (this.bannerHeight - this.data.$titleBarHeight) && titleConfig.title) {
            this.setData({
                titleConfig: {
                    bgColor: 'transparent',
                    iconColor: '#fff',
                    title: '',
                },
            });
        }
    },
    onShareAppMessage: function () {
        return {
            title: '「JI · 记小栈」- 图记',
            path: '/pages/photo/photo',
        };
    },
    getPhotos(page = 1) {
        Request.get(`${Host}/get/photos`, { params: { page } })
            .then((res) => {
            let photoUrls = [];
            let photos = [];
            let baseHeight = 100;
            res.photos.map((photo) => {
                const src = `https://cdn.liayal.com/${photo.key}`;
                photoUrls.push(src);
                photos.push(Object.assign({}, photo, { src, w: photo.width * baseHeight / photo.height, paddingTop: photo.height / photo.width * 100 }));
            });
            this.setData({
                page,
                photos: page == 1 ? photos : this.data.photos.concat(photos),
                photoUrls: page == 1 ? photoUrls : this.data.photoUrls.concat(photoUrls),
                allPage: res.allPage
            }, () => {
                this.setData({
                    showLoading: false,
                });
                wx.stopPullDownRefresh();
                this.isloading = false;
            });
        });
    },
    previewImage(event) {
        const { photoUrls } = this.data;
        const _urls = [...photoUrls];
        let src = event.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: _urls.slice(1),
        });
    },
});
