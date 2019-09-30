export default Behavior({
    methods: {
        getOffsetInfo(selector = '.yh-component-com') {
            return new Promise((reslove) => {
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
