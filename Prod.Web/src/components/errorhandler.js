import {observable} from 'mobx';
const errorhandler = observable({
    _errobjs: [],
    _warnobjs: [],
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
        //     type: "error"
        //     msg: "error message 2"
        // },
        // {
        //     id: "id3", 
        //     get cond() {return obj.prop5 > obj.prop2},
        //     type: "warning"
        //     msg: "warning message 1"
        // },
        // ...
        // ...
        // ]
        // **********************************
        for(const errobj of errorobjectarray) {
            if(errobj.type === undefined || errobj.type === "error" ) {
                this._errobjs.push(errobj)
            } else if(errobj.type === "warning" ) {
                this._warnobjs.push(errobj)
            }
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
    get warnings() {
        const result = {}
        for(const warnobj of this._warnobjs) {
            if(warnobj.cond) {
                result[warnobj.id] = warnobj.msg
            } else {
                result[warnobj.id] = null
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
