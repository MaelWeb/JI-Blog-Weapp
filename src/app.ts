//app.ts
import * as Utils from '@Utils/util'
export interface IMyApp {
    userInfoReadyCallback?(res: wx.UserInfo): void,
    globalData?: {
        SystemInfo: object,
    }
}

App<IMyApp>({
    globalData: {
        SystemInfo: Utils.getSysInfo()
    },
    onLaunch() {
        // @ts-ignore
        wx.cloud.init();
    }
})