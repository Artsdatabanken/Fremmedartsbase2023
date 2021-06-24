import {action, extendObservable} from 'mobx'
import tabItems from '../tabItems'

function assessmentTabdefs(appState) {
    extendObservable(appState, {
    assessmentTabs: {
        activeTab: {id: 0},
        get tabinfos() {return [
            {id: 0, label:"Horisontskanning", enabled: appState.harVurdering, url: "horisontskanning" },
            {id: 1, label:"Artens status", enabled: appState.harVurdering, url: "artensstatus" },
            {id: 2, label:"Artsinformasjon", enabled: appState.horizonDoAssessment , notrequired: !appState.skalVurderes, url: "artinformasjon" },
            {id: 3, label:"Spredningsveier", enabled:  appState.harVurdering, notrequired: !appState.skalVurderes, url: "spredningsveier" },
            {id: 4, label:"Bakgrunnsdata for risikovurdering", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "bakgrunnsdata" },
            {id: 5, label:"Risikovurdering", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "risikovurdering" },
            {id: 6, label:"Klimaeffekter", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "klimaeffekter" },
            {id: 7, label:"Geografisk variasjon", enabled: appState.harVurdering, notrequired: !appState.skalVurderes, url: "geografiskvariasjon" },
            {id: 8, label:"Oppsummering", enabled:appState.harVurdering, url: "oppsummmering"},
            {id: 9, label:"Referanser", enabled:appState.harVurdering, url: "referanser"},
            {id: 10, label:"Kommentar på vurdering", enabled:appState.harVurdering, url: "kommentar"},
            {id: 11, label:"JSON", enabled:appState.harVurdering, url: "diff"}
        ]},
        get tabList() {
            // console.log("##" + this.tabinfos.length)
            return tabItems(this.tabinfos)
 
        },
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
        get tabinfos() {return [
            {id: 1, label: "Spredningsveier i naturen", enabled:true}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
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
        get tabinfos() {return [
            {id: 1, label: "Utbredelse", enabled:true},
            {id: 2, label: "Naturtyper", enabled:true}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
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
        get tabinfos() {return [

            {id: 1, label:"Invasjonspotensiale", enabled:true},
            {id: 2, label: "Økologisk effekt", enabled:true}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.riskAssessmentTabs.activeTab.id = tab.id
                }
            })()
        }
    }
})}

export default assessmentTabdefs