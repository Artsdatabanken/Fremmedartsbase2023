const errorhandler = {
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
}
export default errorhandler
