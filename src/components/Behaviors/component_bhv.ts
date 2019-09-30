export default Behavior({
    methods: {
        /**
         * 获取当前组件节点信息
         *
         * */
        getOffsetInfo(selector = '.yh-component-com') {
            return new Promise((reslove) => {
                // if (this.$domInfo) return reslove(this.$domInfo);
                this.createSelectorQuery()
                    .select(selector)
                    .boundingClientRect((res) => {
                        res && (this.$domInfo = res);
                        reslove(res || {});
                    })
                    .exec();
            });
        },
    },
});
