class WXMLData {
    constructor() {
        this.wxml = []
    }
    public wxml: any[];
    private static instance: WXMLData;

    setWxmlData(data: any[]) {
        this.wxml = data
    }

    getWxmlData(index: number) {
        return this.wxml[index]
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new WXMLData()
        }
        return this.instance
    }
}

export default WXMLData.getInstance()