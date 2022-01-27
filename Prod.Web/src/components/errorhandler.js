import {observable} from 'mobx';
const errorhandler = observable({
    _errobjs: [],
    get hasErrors() {
        return Object.keys(this.errors).length > 0
    },
    addErrors(errobjarr) {
        for(const errobj of errobjarr) {
            this._errobjs.push(errobj)
        }
    },
    get errors() {
        const result = {}
        for(const errobj of this._errobjs) {
            if(errobj.cond) {
                result[errobj.id] = errobj.msg
            }
        }
        return result
    },
    get errorsMsg() {
        const result = []
        const keys = Object.keys(errors)
        const okeys = keys.sort()
        for(const key of okeys) {
            result.add(this.errors[key])
        }
        return result
    }
})
export default errorhandler
