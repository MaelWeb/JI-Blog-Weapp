import ArticeWxml from '../../articeWxml'
Component({
    properties: {
        index: {
            type: Number,
            value: null,
            observer(newVal) {
                if(newVal >= 0) {
                    this.setData({
                        item: ArticeWxml.getWxmlData(newVal)
                    })
                }
            }
        }
    }  
})