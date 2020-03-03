import ArticeWxml from '../pages/article/articeWxml'

Component({
    options: {
        styleIsolation: 'shared'
    },
    properties: {
        index: {
            type: Number,
            value: null,
            observer(newVal, oldVal) {
                if (newVal >= 0 && newVal !== oldVal) {
                    this.setData({
                        nodes: {
                            child: ArticeWxml.getWxmlData(newVal),
                            theme: 'light',
                        }
                    }, this.componentDidUpdate)
                }
            }
        }
    },
    methods: {
        componentDidUpdate() {
            this.triggerEvent('componentDidUpdate')
        }
    }
})