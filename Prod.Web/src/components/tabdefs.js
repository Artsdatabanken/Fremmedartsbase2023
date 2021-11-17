import {action, extendObservable} from 'mobx'
import tabItems from './tabItems'

function tabdefs(appState) {
    return {
    selectAssessmentTabs: {
        activeTab: {id: 1},
        get tabinfos() {return [

            {id: 1, label:appState.koder.mainSelectAssessment, enabled:true},
            {id: 2, label:appState.koder.mainCreateAssessment, enabled:true},
            {id: 3, label:appState.koder.mainStatistics, enabled:true, visible: appState.showstatistikk},
            {id: 4, label:appState.koder.mainReport, enabled:true}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
        setActiveTab: (tab) => {
            action(() => {
                // console.log('xxx', appState.selectAssessmentTabs.activeTab)
                // console.log('xxx', tab)
                if(tab.enabled) {
                    appState.selectAssessmentTabs.activeTab.id = tab.id
                    appState.assessmentId = null
                    //                            appState.router.hash = "#" + tab.url + "/" + appState.assessmentId
                }
            })()
        }
    }

}}

export default tabdefs