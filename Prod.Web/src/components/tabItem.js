import {extendObservable} from 'mobx'

class tabItem {
    constructor(param) {
        extendObservable(this, {
            'id': param.id,
            'name': param.label,
            'enabled': () => param.enabled === undefined ? true : param.enabled,
            'visible': () => param.visible === undefined ? true : param.visible,
            'notrequired': () => param.notrequired === undefined ? false : param.notrequired,
            'url': param.url
        })
    }
}

export default tabItem