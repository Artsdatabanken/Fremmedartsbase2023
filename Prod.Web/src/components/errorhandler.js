import {observable} from 'mobx';
const errorhandler = observable({
    _errobjs: [],
    _warnobjs: [],
    _infoobjs: [],
    _allids:{},
    get hasErrors() {
        return Object.keys(this.errors).filter(key => this.errors[key] !== null).length > 0
    },
    get hasWarnings() {
        return Object.keys(this.warnings).filter(key => this.warnings[key] !== null).length > 0
    },
    get hasInfos() {
        return Object.keys(this.infos).filter(key => this.infos[key] !== null).length > 0
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
            if(errobj.type === undefined) {
                errobj.type = "error"
            } 
            if(errobj.type === "error" ) {
                this._errobjs.push(errobj)
            } else if(errobj.type === "warning" ) {
                this._warnobjs.push(errobj)
            } else if(errobj.type === "info" ) {
                this._infoobjs.push(errobj)
            }
            this._allids[errobj.id] = errobj
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

    get infos() {
        const result = {}
        for(const infoobj of this._infoobjs) {
            if(infoobj.cond) {
                result[infoobj.id] = infoobj.msg
            } else {
                result[infoobj.id] = null
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
errorhandler.resolveid = function(id) {
    const allids = errorhandler._allids
    return id in allids ? allids[id].cond : false
}


export default errorhandler
