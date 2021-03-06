Component({
    properties: {
        isShow: {
            type: Boolean,
            value: false,
            optionalTypes: [Boolean],
        },
        size: {
            type: String,
            value: 'default', // default, small, large
            optionalTypes: [String],
        },
        position: {
            type: String,
            value: 'relative', // fixed, absolute
            optionalTypes: [String],
        },
        color: {
            type: String,
            value: '#181e1e',
            optionalTypes: [String],
        },
    },
})
