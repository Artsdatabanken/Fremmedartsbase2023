import {observable} from 'mobx';
const errorhandler = observable({
    _errobjs: [],
    get hasErrors() {
        return Object.keys(this.errors).filter(key => this.errors[key] !== null).length > 0
    },
    addErrors(errorobjectarray) {
        // **** errorobjectarray format ****
        // [ {
        //     id: "id1", 
        //     get cond() {return obj.prop1 === 0},
        //     msg: "error message 1"
        // },
        // {
        //     id: "id2", 
        //     get cond() {return obj.prop1 > obj.prop2},
        //     msg: "error message 2"
        // },
        // ...
        // ...
        // ]
        // **********************************
        for(const errobj of errorobjectarray) {
            this._errobjs.push(errobj)
        }
    },
    get errors() {
        const result = {}
        for(const errobj of this._errobjs) {
            if(errobj.cond) {
                result[errobj.id] = errobj.msg
            } else {
                result[errobj.id] = null
            }
        }
        return result
    },
    // get errorsMsg() {
    //     const result = []
    //     const keys = Object.keys(this.errors)
    //     const okeys = keys.sort()
    //     for(const key of okeys) {
    //         result.add(this.errors[key])
    //     }
    //     return result
    // },
    // get hasError() {
    //     const result = {}
    //     for(const key in Object.keys(this.errors)) {

    //     }
    // }
})
export default errorhandler
