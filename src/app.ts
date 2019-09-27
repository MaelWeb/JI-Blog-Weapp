//app.ts
export interface IMyApp {
    userInfoReadyCallback?(res: wx.UserInfo): void
}

App<IMyApp>({})