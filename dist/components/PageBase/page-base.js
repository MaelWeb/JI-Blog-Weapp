import CommonBehaviors from '../Behaviors/component_bhv';
import * as BaseUtils from '../../utils/util';
const APP = getApp();
const sysinfo = APP.globalData.SystemInfo;
Component({
    behaviors: [CommonBehaviors],
    options: {
        multipleSlots: true,
    },
    properties: {
        titleConfig: {
            type: Object,
            value: {
                title: '',
                bgColor: '#fff',
                iconColor: "#000",
                align: 'center',
            },
        },
        titleSlot: {
            type: Boolean,
            value: false,
        },
        showMenu: {
            type: Boolean,
            value: false,
        },
        showLoading: {
            type: Boolean,
            value: false,
        },
        titleHeight: {
            type: Number,
            value: 44,
            observer(newVal) {
                if (newVal > 44) {
                    this.setData({
                        paddingTop: newVal + sysinfo.statusBarHeight,
                    });
                    BaseUtils.getPage().setData && BaseUtils.getPage().setData({
                        $titleBarHeight: newVal + sysinfo.statusBarHeight,
                    });
                }
            }
        },
        paddingTop: {
            type: Number,
            value: 44 + sysinfo.statusBarHeight,
        }
    },
    data: {
        statusBarHeight: sysinfo.statusBarHeight,
    },
    ready() {
        BaseUtils.getPage().setData({
            $titleBarHeight: this.data.paddingTop,
        });
    },
    methods: {
        closeMenu() {
            this.setData({
                showMenu: false,
            });
        }
    }
});
