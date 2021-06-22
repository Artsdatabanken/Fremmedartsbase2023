import {action, extendObservable} from 'mobx'

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

function tabdefs(appState) {
    return {
    selectAssessmentTabs: {
        activeTab: {id: 1},
        tabList: () => [
            new tabItem({id: 1, label:appState.koder.mainSelectAssessment, enabled:true}),
            new tabItem({id: 2, label:appState.koder.mainCreateAssessment, enabled:true}),
            new tabItem({id: 3, label:appState.koder.mainStatistics, enabled:true, visible: appState.showstatistikk}),
            new tabItem({id: 4, label:appState.koder.mainReport, enabled:true})
        ],
        setActiveTab: (tab) => {
            action(() => {
                console.log('xxx', appState.selectAssessmentTabs.activeTab)
                console.log('xxx', tab)
                if(tab.enabled) {
                    appState.selectAssessmentTabs.activeTab.id = tab.id
                    appState.assessmentId = null
                    //                            appState.router.hash = "#" + tab.url + "/" + appState.assessmentId
                }
            })()
        }
    },


    assessmentTabs: {
        activeTab: {id: 0},
        tabList: [
            new tabItem({id: 0, label:"Horisontskanning", enabled: appState.harVurdering, url: "horisontskanning" }),
            new tabItem({id: 1, label:"Artens status", enabled: appState.harVurdering, url: "artensstatus" }),
            new tabItem({id: 2, label:"Artsinformasjon", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "artsegenskaper" }),
            new tabItem({id: 3, label:"Spredningsveier", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "spredningsveier" }),
            new tabItem({id: 4, label:"Informasjon for risikovurdering", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "utbredelseshistorikk" }),
            new tabItem({id: 5, label:"Risikovurdering", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "invasjonspotensiale" }),
            new tabItem({id: 6, label:"Klimaeffekter", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "klimaeffekter" }),
            new tabItem({id: 7, label:"Geografisk variasjon", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "geografiskvariasjon" }),
            new tabItem({id: 8, label:"Oppsummering", enabled:appState.harVurdering, url: "oppsummmering"}),
            new tabItem({id: 11, label:"Kriteriedokumentasjon", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "kriteriedokumentasjon" }),
            new tabItem({id: 9, label:"Referanser", enabled:appState.harVurdering, url: "referanser"}),
            new tabItem({id: 10, label:"Kommentar på vurdering", enabled:appState.harVurdering, url: "kommentar"}),
            new tabItem({id: 12, label:"JSON", enabled:appState.harVurdering, url: "diff"})
        ],
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.assessmentTabs.activeTab.id = tab.id
                    //                            appState.router.hash = "#" + tab.url + "/" + appState.assessmentId
                }
            })()
        }
    },
    spredningsveierTabs: {
        activeTab: {id: 1},
        tabList: [
            new tabItem({id: 1, label: "Spredningsveier i naturen", enabled:true})
        ],
        setActiveTab: (tab) => {
            action(() => {
                //console.log('xxx', appState.selectAssessmentTabs.activeTab)
                //console.log('xxx', tab)
                if(tab.enabled) {
                    appState.spredningsveierTabs.activeTab.id = tab.id
                    //appState.assessmentId = null
                    //                            appState.router.hash = "#" + tab.url + "/" + appState.assessmentId
                }
            })()
        }
    },

    infoTabs: {
        activeTab: {id: 1},
        tabList: [
            new tabItem({id: 1, label: "Utbredelse", enabled:true}),
            new tabItem({id: 2, label: "Naturtyper", enabled:true})
        ],
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.infoTabs.activeTab.id = tab.id
                }
            })()
        }
    },
    riskAssessmentTabs: {
        activeTab: {id: 1},
        tabList: [
            new tabItem({id: 1, label:"Invasjonspotensiale", enabled:true}),
            new tabItem({id: 2, label: "Økologisk effekt", enabled:true})
        ],
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.riskAssessmentTabs.activeTab.id = tab.id
                }
            })()
        }
    }
}}

export default tabdefs