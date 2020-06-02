/**
 *  copy from https://github.com/omichelsen/compare-versions
 *
 * Usage:
 *
 * import CompareVersions from '@YHLibs/Utils/compare-versions'
 *
 * */

const allowedOperators = [
    '>',
    '>=',
    '=',
    '<',
    '<='
]

const operatorResMap: { [key: string]: number[] } = {
    '>': [1],
    '>=': [0, 1],
    '=': [0],
    '<=': [-1, 0],
    '<': [-1]
}

const semver = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i

class CompareVersions {

    indexOrEnd(str: string, q: string) {
        return str.indexOf(q) === -1 ? str.length : str.indexOf(q)
    }

    split(v: string) {
        var c = v.replace(/^v/, '').replace(/\+.*$/, '')
        var patchIndex = this.indexOrEnd(c, '-')
        var arr = c.substring(0, patchIndex).split('.')
        arr.push(c.substring(patchIndex + 1))
        return arr
    }

    tryParse(v: string) {
        return isNaN(Number(v)) ? v : Number(v)
    }

    validate = (version: string) => {
        if (typeof version !== 'string') {
            throw new TypeError('Invalid argument expected string')
        }
        if (!semver.test(version)) {
            throw new Error('Invalid argument not valid semver (\'' + version + '\' received)')
        }
    }

    compareVersions = (v1: string, v2: string) => {
        [v1, v2].forEach(this.validate)

        const s1 = this.split(v1)
        const s2 = this.split(v2)

        for (let i = 0; i < Math.max(s1.length - 1, s2.length - 1); i++) {
            const n1 = parseInt(s1[i] || '0', 10)
            const n2 = parseInt(s2[i] || '0', 10)

            if (n1 > n2) return 1
            if (n2 > n1) return -1
        }

        const sp1 = s1[s1.length - 1]
        const sp2 = s2[s2.length - 1]

        if (sp1 && sp2) {
            const p1 = sp1.split('.').map(this.tryParse)
            const p2 = sp2.split('.').map(this.tryParse)

            for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
                if (p1[i] === undefined || typeof p2[i] === 'string' && typeof p1[i] === 'number') return -1
                if (p2[i] === undefined || typeof p1[i] === 'string' && typeof p2[i] === 'number') return 1

                if (p1[i] > p2[i]) return 1
                if (p2[i] > p1[i]) return -1
            }
        } else if (sp1 || sp2) {
            return sp1 ? -1 : 1
        }

        return 0
    }

    validateOperator = (op: string) => {
        if (typeof op !== 'string') {
            throw new TypeError('Invalid operator type, expected string but got ' + typeof op)
        }
        if (allowedOperators.indexOf(op) === -1) {
            throw new TypeError('Invalid operator, expected one of ' + allowedOperators.join('|'))
        }
    }

    compare = (v1: string, v2: string, operator: string) => {
        // Validate operator
        this.validateOperator(operator)

        // since result of compareVersions can only be -1 or 0 or 1
        // a simple map can be used to replace switch
        const res = this.compareVersions(v1, v2)
        return operatorResMap[operator].indexOf(res) > -1
    }
}

const _CompareVersions = new CompareVersions()
export const compare = _CompareVersions.compare
export default _CompareVersions.compareVersions