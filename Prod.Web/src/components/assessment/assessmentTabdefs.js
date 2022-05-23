import {action, extendObservable} from 'mobx'
import tabItems from '../tabItems'
import auth from '../authService';

function assessmentTabdefs(appState) {
    extendObservable(appState, {
    assessmentTabs: {
        activeTab: {id: appState.horizonDoScanning ? 0 : 1},
        get tabinfos() {return [
            {id: 0, label:"Horisontskanning", enabled: appState.harVurdering, visible: (appState.horizonDoScanning || appState.horizonScanned), url: "horisontskanning" },
            {id: 1, label:"Artens status", enabled: !appState.horizonDoScanning, url: "artensstatus" },
            {id: 2, label:"Artsinformasjon", enabled: !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "artinformasjon" },
            {id: 3, label:"Spredningsveier", enabled: !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "spredningsveier" },
            {id: 4, label:"Bakgrunnsdata for risikovurdering", enabled: !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "bakgrunnsdata" },
            {id: 5, label:"Risikovurdering", enabled: appState.doFullAssessment && !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "risikovurdering" },
            {id: 6, label:"Klimaeffekter", enabled: appState.doFullAssessment && !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "klimaeffekter" },
            {id: 7, label:"Geografisk variasjon", enabled: appState.doFullAssessment && !appState.horizonDoScanning, notrequired: !appState.skalVurderes, url: "geografiskvariasjon" },
            {id: 8, label:"Oppsummering", enabled: !appState.horizonDoScanning, url: "oppsummmering"},
            {id: 9, label:"Referanser", enabled: appState.harVurdering, url: "referanser"},
            {id: 10, label:"Kommentar på vurdering", enabled:appState.harVurdering, url: "kommentar"},
            {id: 11, label:"JSON", enabled: appState.harVurdering && auth.user.profile.email.indexOf("artsdatabanken.no") > -1, url: "diff"}
        ]},
        get tabList() {
            // console.log("##" + this.tabinfos.length)
            return tabItems(this.tabinfos)
 
        },
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.assessmentTabs.activeTab.id = tab.id
                    window.scrollTo(0,0)
                    // appState.router.hash = "#" + tab.url + "/" + appState.assessmentId
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
                if(tab.enabled) {
                    appState.spredningsveierTabs.activeTab.id = tab.id
                    window.scrollTo(0,0)
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
                    window.scrollTo(0,0)
                }
            })()
        }
    },
    riskAssessmentTabs: {
        activeTab: {id: 1},
        get tabinfos() {return [

            {id: 1, label:"Invasjonspotensiale", enabled: appState.doFullAssessment},
            {id: 2, label: "Økologisk effekt", enabled: appState.doFullAssessment}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.riskAssessmentTabs.activeTab.id = tab.id
                    window.scrollTo(0,0)
                }
            })()
        }
    },
    moveAssessmentTabs: {
        activeTab: {id: 1},
        get tabinfos() {return [

            {id: 1, label:"Nytt artsnavn", enabled:true},
            {id: 2, label: "Horisontskanning/risikovurdering", enabled:true}
        ]},
        get tabList() { return tabItems(this.tabinfos) },
        setActiveTab: (tab) => {
            action(() => {
                if(tab.enabled) {
                    appState.moveAssessmentTabs.activeTab.id = tab.id
                    window.scrollTo(0,0)
                }
            })()
        }
    }

})}

export default assessmentTabdefs