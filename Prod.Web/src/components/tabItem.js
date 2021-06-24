import { extendObservable } from 'mobx'

class tabItem {
    constructor(param) {
        extendObservable(this, {
            id: param.id,
            name: param.label,
            get enabled() { return param.enabled === undefined ? true : param.enabled },
            get visible() { return param.visible === undefined ? true : param.visible },
            get notrequired() { return param.notrequired === undefined ? false : param.notrequired },
            url: param.url
        })
    }
}

export default tabItem