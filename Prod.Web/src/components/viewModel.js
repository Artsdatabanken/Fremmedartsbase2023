import {action, autorun, computed, extendObservable, flow, observable, reaction, runInAction,trace, transaction, toJS} from 'mobx'
import {router} from "./routeMatcher"
import events from './event-pubsub'
// import {HttpTransportType, HubConnectionBuilder, JsonHubProtocol, LogLevel} from "@microsoft/signalr"
import * as signalR from "@microsoft/signalr"
// import enhanceWithRiskEvaluation from "./CategoryCriteria"
import {codes2labels} from '../utils'
import config from '../config'
import auth from './authService'
import createContext from './createContext'
import enhanceAssessment from './assessment/enhanceAssassment.js'
import { checkStatus, loadData } from '../apiService'
import { any } from 'prop-types'
// import { ConfigurationManager } from '../../dist/Prod.Web.e31bb0bc'

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


class ViewModel {
    constructor() {
        const options = {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            logMessageContent: true,
            logger: signalR.LogLevel.Trace
            //accessTokenFactory: () => this.props.accessToken,  // todo: <---- check this 
        }



        // utkommenterer SignalR foreløpig for å unngå støy i consollog

        // // // // // // console.log("#########################################################")
        // // // // // // console.log(JSON.stringify(signalR))
        // // // // // // console.log("#########################################################")

        // // // // // this.hubConnection = new signalR.HubConnectionBuilder()
        // // // // // .configureLogging(signalR.LogLevel.Debug)
        // // // // // .withUrl(config.getSignalRUrl, {
        // // // // //         // skipNegotiation: true,
        // // // // //         // transport: signalR.HttpTransportType.WebSockets,
        // // // // //         logMessageContent: true,
        // // // // //         logger: signalR.LogLevel.Trace
        // // // // //         //accessTokenFactory: () => this.props.accessToken,  // todo: <---- check this 
        // // // // //     })
        // // // // //     .withAutomaticReconnect()
        // // // // //     .withHubProtocol(new signalR.JsonHubProtocol())
        // // // // //     .build()
        // // // // // this.hubConnection.on("ReceiveMessage", (context, message) => {
        // // // // //         // alert("SignalR: " + context + " - " + message)
        // // // // //         events.trigger(context, message)
        // // // // //     });
            
        // // // // // this.hubConnection
        // // // // //     .start()
        // // // // //     .then(() => console.info('SignalR Connected'))
        // // // // //     .catch(err => console.error('SignalR Connection Error: ', err));


            

        extendObservable(this, {
            harVurdering: () => !!this.assessment
        })
        extendObservable(this, {
            skalVurderes: () => true // todo: implement!
        })

        // -------------------------------------
        extendObservable(this, {
            router: null,
            viewMode: "choosespecie",
            assessmentId: null,
            assessment: null,
            assessmentSavedVersion: null,
            assessmentSavedVersionString: null,
            expertGroupModel: null,
            language: null,
            userContext: {
                readonly: false
            },
            comments: [],
            newComment: null,
            artskartModel: {},
            koder: null,
            påvirkningsfaktorer: [],
            spredningsveier: null,
            selectedPåvirkningsfaktor: {
                id: null,
                forkortelse: null,
                overordnetTittel: null,
                beskrivelse: null,
                tidspunkt: null,
                omfang: null,
                alvorlighetsgrad: null,
                comment: null
            },
            codeLabels: null,

            naturtypeLabels: {},

            expertgroups: null, // [],
            expertgroup: null,
            roleincurrentgroup: null,
            expertgroupAssessmentList: [],
            expertgroupAssessmentFilter: "",
            expertgroupCategoryFilter: "",
            expertgroupCategoryCheckboxFilter: [],
            statusCheckboxFilter: [],
            decisiveCriteriaFilter: [],
            riskCategoryFilter: [],
            riskAssessedFilter: [],
            riskNotAssessedFilter: [],
            filterType: [],
            kunUbehandlede: false,
            kunMine: false,
            withComments: false,
            withNewComments: false,
            withPotentialTaxonChanges: false,
            withAutomaticNameChanges: false,   
            ekspertgruppeReport: null,
            lockedForEditByUser: null,
            assessmentIsSaving: false,
			showSaveSuccessful: false,
            showSaveFailure: false,
            artificialAndConstructedSites: ["F4", "F5", "H4", "L7", "L8", "M14", "M15", "T35", "T36", "T37", "T38", "T39", "T40", "T41", "T42", "T43", "T44", "T45", "V11", "V12", "V13"],
            antallVurderinger: 0,
            antallUbehandlede: 0,
            antallTaxonEndring: 0,
            antallNavnEndret: 0,
            loadingExpertGroup: false,
            includeLC: false  ,
            evaluationContext: 'N',
            evaluationContexts: {
                'N': {
                    name: 'Norge',
                    nameWithPreposition: 'i Norge',
                    map: 'norge'
                },
                'S': {
                    name: 'Svalbard',
                    nameWithPreposition: 'på Svalbard',
                    map: 'svalbard'
                }
            },   
            
            assessmentType: "",
            vurdert: false,
            ikkevurdert: false

        })

      

        this.initializeServices()
        // ---------------

        // const labels = require('../FA3CodesNB.json') 
        const codes = require('../FA3CodesNB.json') 
        // console.log("codes:" + typeof(codes))
        const clabels =  codes2labels(codes.Children.labels[0].Children)
        // console.log("clabels:", clabels)


        console.log("labels keys: " + JSON.stringify(Object.keys(clabels)))
        console.log("codes keys: " + JSON.stringify(Object.keys(codes.Children)))
        // console.log("codes json: " + JSON.stringify(codes))
        // console.log("----------------------------------------------+++")
        // console.log(JSON.stringify(clabels))
        this.codeLabels = clabels
        //
        this.koder = codes

        //-----------------------------------------------------

        const mp = this.koder.Children.migrationPathways[0]
        this.spredningsveier = this.koder2migrationPathways(mp)
        //-----------------------------------------------------


        this.theUserContext = createContext(this.userContext)   

		let savetimer = null
		events.on("saveAssessment",
			(tag) => {
				if (tag === "savestart") {
					 console.log("save vurdering starter")
					action(() => this.assessmentIsSaving = true)()
					savetimer = setTimeout(() => events.trigger("saveAssessment", "timeout"), 30000)
					 console.log("save vurdering starter -")
				} else if (tag === "timeout") {
					 console.log("save vurdering timeout")
                     action(() => this.assessmentIsSaving = false)()
				} else if (tag === "savesuccess") {
					clearTimeout(savetimer)
					 console.log("save vurdering successfull")
					action(() => this.assessmentIsSaving = false)()
                    action(() => this.showSaveSuccessful = true)()
					setTimeout(() => {action(() => this.showSaveSuccessful = false)()}, 3000)
					 console.log("save vurdering successfull -")
                } else if (tag === "savefailure") {
					clearTimeout(savetimer)
					console.log("save vurdering failure")
					action(() => this.assessmentIsSaving = false)()
                    action(() => this.showSaveFailure = true)()
					setTimeout(() => {action(() => this.showSaveFailure = false)()}, 3000)
					console.log("save vurdering failure -")
				}
			})

		events.on("assessment",
			(tag) => {
				if (tag === "open") {
					 console.log("signalR: *open*")
				} else if (tag === "save") {
                     console.log("signalR: *save*")
                }
			})





        // autorun(() => {
        //     console.log("selectedPåvirkningsfaktor: " + (this.selectedPåvirkningsfaktor ? this.selectedPåvirkningsfaktor.id : "None"))
        // });


        autorun(() => {
            // Lurer Mobx til å kjøre koden... TODO: Gjør dette på en "riktig" måte
            this._viewMode = this.viewMode
            this._assessment = this.assessment
            this._evaluationStatus = !this.assessment || this.assessment.evaluationStatus

            runInAction(() => {
                this.userContext.readonly = (
                    this.viewMode === "assessment" && 
                    (
                        (!this.assessment || this.assessment.lockedForEditByUser !== auth.userName ) ||
                        (!this.assessment || this.assessment.evaluationStatus === "finished" )
                    )
                )
            })
            if (this.expertgroupAssessmentList) {
                let list = this.expertgroupAssessmentList
                let countTotal = 0
                let countOpen = 0
                let countNew = 0
                let countTaxon = 0
                let countName = 0
                list.forEach (row => {
                    if (row.commentClosed > 0 || row.commentOpen > 0) {
                        countTotal++
                    }
                    if ( row.commentOpen > 0){
                        countOpen++
                    }
                    if ( row.commentNew > 0){
                        countNew++
                    }
                    if ( row.taxonChange == 2){
                        countTaxon++
                    }
                    if ( row.taxonChange == 1){
                        countName++
                    }
                })
                action (()  => {
                    this.antallVurderinger = countTotal
                    this.antallUbehandlede = countOpen
                    this.antallNye = countNew
                    this.antallTaxonEndring = countTaxon
                    this.antallNavnEndret = countName
                })()
            }
        });


        // extendObservable(this, {
        //     isDirty: () => {
        //         const a = JSON.stringify(this.assessment)
        //         const b = this.assessmentSavedVersionString
        //         return a != b
        //     }
        // })
        autorun(() => {
            console.log("dirty: " + this.isDirty)
        });
        autorun(() => {
            console.log("isServicesReady: " + this.isServicesReady)
            // console.log("- koder:" + this.koder != null)
            console.log("exp" + (this.expertgroups != null))
            // console.log("-lab" + this.codeLabels != null)
        });
        autorun(() => {
            console.log("viewMode: " + this.viewMode)
        });

       
        reaction(() => this.assessmentId,
            assessmentId => {
                console.log("x: " + this.assessmentId + " " + typeof(this.assessmentId) + " " + (this.assessment ? this.assessment.id : "nix"))
                if (assessmentId) {
                    this.setCurrentAssessment(assessmentId)
                } else {
                    this.setCurrentAssessment(null)
                    action(() => this.viewMode = "choosespecie")
                }
            }
        );


        autorun(() => {
            if (this.viewMode === "choosespecie") {
                this.setCurrentAssessment(null)
                // this.setCurrentAssessment( 291556)
            }
        });

        reaction(
            () => this.assessment,
            assessment => {
                if (assessment && this.isServicesReady) {
                    // console.log("viewMode = 'assessment' - before:" + this.viewMode)
                    this.viewMode = "assessment"
                }
            })



        reaction(
            () => this.assessmentId,
            async assessmentId => {
                console.log("ny assessmentId: " + assessmentId)
            }
        )

        reaction(
            () => this.assessment,
            assessment => {
                console.log(assessment ? "ny assessment: " + assessment.id : "no assessment")
                // if (assessment && !assessment.oppsummeringA) {
                //     enhanceWithRiskEvaluation(assessment); 
                //     console.log("assessment enhanced")
                // }
                // console.trace()
            }
        )


        reaction(
            () => [this.expertgroup, auth.isLoggedIn],
            ([expertgroupId, isLoggedIn])  => {
                //console.log("react to expertgroup: " + expertgroupId + "," + isLoggedIn)
                if(isLoggedIn && expertgroupId) {
                    this.loadCurrentExpertgroupAssessmentList()
                } else {
                    this.expertgroupAssessmentList = []
                }
            }
        )

        // enhanceWithRiskEvaluation({}); // this.assessment, this.kritHelpers);

        // console.log("assessmentId:" + this.assessmentId)
  
        extendObservable(this, {
            assessmentTabs: {
                activeTab: {id: 0},
                tabList: [
                    new tabItem({id: 0, label:"Horisont-skanning", enabled: this.harVurdering, url: "horisont-skanning" }),
                    new tabItem({id: 1, label:"Artens status", enabled: this.harVurdering, url: "artensstatus" }),
                    new tabItem({id: 2, label:"Artsinformasjon", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "artsegenskaper" }),
                    new tabItem({id: 3, label:"Spredningsveier", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "import" }),
                    //new tabItem({id: 4, label:"Spredningsveier", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "spredningsveier" }),
                    new tabItem({id: 4, label:"Informasjon for risikovurdering", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "utbredelseshistorikk" }),
                    //new tabItem({id: 5, label:"Naturtyper", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "naturtyper" }),
                    new tabItem({id: 5, label:"Risikovurdering", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "invasjonspotensiale" }),
                    //new tabItem({id: 7, label:"Økologisk effekt", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "ekologiskeffekt" }),
                    //new tabItem({id: 9, label:"Geografisk variasjon", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "geografiskvariasjon" }),
                    new tabItem({id: 6, label:"Klimaeffekter", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "klimaeffekter" }),
                    new tabItem({id: 7, label:"Geografisk variasjon", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "geografiskvariasjon" }),
                    //new tabItem({id: 9, label:"Kriteriedokumentasjon", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "kriteriedokumentasjon" }),
                    // new tabItem({id: 9, label:"Oppsummering", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "oppsummering" }),
                    new tabItem({id: 8, label:"Oppsummering", enabled:this.harVurdering, url: "oppsummmering"}),
                    new tabItem({id: 9, label:"Referanser", enabled:this.harVurdering, url: "referanser"}),
                    new tabItem({id: 10, label:"Kommentar på vurdering", enabled:this.harVurdering, url: "kommentar"}),
                    // new tabItem({id: 11, label:"Kommentarer", enabled:this.harVurdering, url: "Kommentarer"}),
                    new tabItem({id: 11, label:"JSON", enabled:this.harVurdering, url: "diff"})
                    // new tabItem({id: 1, label:"Artsinformasjon", enabled: this.harVurdering, url: "artsinformasjon" }),
                    // new tabItem({id: 2, label:"Naturtyper", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "naturtyper" }),
                    // new tabItem({id: 3, label:"Påvirkning", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "pavirkning" }),
                    // new tabItem({id: 4, label:"A", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "a" }),
                    // new tabItem({id: 5, label:"B", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "b" }),
                    // new tabItem({id: 6, label:"C", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "c" }),
                    // new tabItem({id: 7, label:"D", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "d" }),
                    // new tabItem({id: 8, label:"E", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "e" }),
                    // new tabItem({id: 9, label:"Oppsummering", enabled: this.harVurdering, notrequired: !this.skalVurderes, url: "oppsummering" }),
                    // new tabItem({id: 10, label:"Referanser", enabled:this.harVurdering, url: "referanser"}),
                    // new tabItem({id: 11, label:"Kommentarer", enabled:this.harVurdering, url: "Kommentarer"}),
                    // new tabItem({id: 12, label:"JSON", enabled:this.harVurdering, url: "diff"})
                ],
                setActiveTab: (tab) => {
                    action(() => {
                        if(tab.enabled) {
                            this.assessmentTabs.activeTab.id = tab.id
                            //                            this.router.hash = "#" + tab.url + "/" + this.assessmentId
                        }
                    })()
                }
            },
            selectAssessmentTabs: {
                activeTab: {id: 1},
                tabList: () => [
                    new tabItem({id: 1, label:this.koder.mainSelectAssessment, enabled:true}),
                    new tabItem({id: 2, label:this.koder.mainCreateAssessment, enabled:true}),
                    new tabItem({id: 3, label:this.koder.mainStatistics, enabled:true, visible: this.showstatistikk}),
                    new tabItem({id: 4, label:this.koder.mainReport, enabled:true})
                ],
                setActiveTab: (tab) => {
                    action(() => {
                        console.log('xxx', this.selectAssessmentTabs.activeTab)
                        console.log('xxx', tab)
                        if(tab.enabled) {
                            this.selectAssessmentTabs.activeTab.id = tab.id
                            this.assessmentId = null
                            //                            this.router.hash = "#" + tab.url + "/" + this.assessmentId
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
                        //console.log('xxx', this.selectAssessmentTabs.activeTab)
                        //console.log('xxx', tab)
                        if(tab.enabled) {
                            this.infoTabs.activeTab.id = tab.id
                            //this.assessmentId = null
                            //                            this.router.hash = "#" + tab.url + "/" + this.assessmentId
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
                        //console.log('xxx', this.riskAssessmentTabs.activeTab)
                        //console.log('xxx', tab)
                        if(tab.enabled) {
                            this.riskAssessmentTabs.activeTab.id = tab.id
                            //this.assessmentId = null
                            //                            this.router.hash = "#" + tab.url + "/" + this.assessmentId
                        }
                    })()
                }
            }
        })

        const createRoutes = tablist => {
            const items = []
            tablist.forEach(tabitem => {
                const item = [tabitem.url + "/:id", params => this.navigate(tabitem.id, params.id)]
                items.push(item)
            })
            return items
        }

        const routes = createRoutes(this.assessmentTabs.tabList)

        autorun(() => {
            if (this.router && this.assessmentTabs) {
                const hash = this.router.hash.substr(1) // when user changes the url hash -
                router(hash, routes) // - then navigate
            }
        })

        //this.assessmentId = 3155 //1231

    }

    getUrl = config.getUrl


    get UserContext() {return this.theUserContext};

    @computed get isLockedByMe() {
        if (!this.assessment) return false;
        return this.assessment.lockedForEditByUser === auth.userName;
    };
    
    @computed get isFinnished() {
        if (!this.assessment) return false;
        return (
        this.assessment.evaluationStatus &&
        this.assessment.evaluationStatus === "finished"
        );
    };
    
    @computed get canEdit() {
        if (!auth.hasAccess) return false;
        if (appState.viewMode === "choosespecie") return false;
        return isLockedByMe() && !isFinished();
    };
        

    @computed get isServicesReady() {
        return (
            this.expertgroups != null )
            // this.koder != null &&
            // this.expertgroups != null &&
            // this.codeLabels != null)
    }

    @computed get isDirty() {
        if (!this.assessmentId) return false
        const a = JSON.stringify(this.assessment)
        const b = this.assessmentSavedVersionString
        return a != b
    }

    @computed get AssessmentReportLink() {
        if (!this.assessment) {
            return null
        }
        const docid = this.assessmentId
        const url = config.getUrl("artsrapport/assessmentview/") + docid
        // console.log("URL:" + url)
        return url
    }

    @computed get unresolvedComments() {
        const comments = this.assessmentComments
        const unresolvedComments = comments.filter(comment => !comment.resolved)
        const count = unresolvedComments.count
        return count
    }


    @computed get canAddSelectedPåvirkningsfaktor() {
        var sp = this.selectedPåvirkningsfaktor
        var validsp = (sp.id === "11." || sp.id === "0.") ?  // ukjent og ingen trussel
            // sp.tidspunkt === "-" &&
            // sp.omfang === "-" &&
            // sp.alvorlighetsgrad === "-" 
            true :
            // sp.forkortelse &&
            sp.beskrivelse &&
            sp.tidspunkt != "-" &&
            sp.omfang != "-" &&
            sp.alvorlighetsgrad != "-"
        return validsp
    }

    @action clearSelectedPåvirkningsfaktor() {
        transaction(() => {
            const sp = this.selectedPåvirkningsfaktor
            sp.id = null
            sp.forkortelse = null
            sp.overordnetTittel = null
            sp.beskrivelse = null
            sp.tidspunkt = null
            sp.omfang = null
            sp.alvorlighetsgrad = null
            sp.comment = null
        })
    }

    @computed get expertgroupAssessmentFilteredList() {
        const list = this.expertgroupAssessmentList
        const originalFilter = this.expertgroupAssessmentFilter.toLowerCase()
        const filter = this.expertgroupAssessmentFilter.toLowerCase().replace(" ", "/")        
        //console.log(filter)
        // const katFilter = this.expertgroupCategoryFilter.toLowerCase().replace(" ", "/")
       // const result = list.filter (ega =>
         //   (filter === "" || (ega.taxonHierarcy.toLowerCase().indexOf(filter) > -1) ))
        var bollefilter = function(item, bolle){
            if (bolle === "!") return true;
            var balle = bolle.substring(1); // ta bort utropstegn
            var items = item.taxonHierarcy.toLowerCase().split("/"); // del opp sti i array
            if (items[5].indexOf(balle) == 0) return true; // element 6 er slekt 
            return false;
        } 
        const result = list.filter(ega => 
            ((filter === "" || (filter.indexOf("!") > -1 ? bollefilter(ega, filter) : ((ega.taxonHierarcy.toLowerCase().indexOf(filter) > -1 || ega.scientificName.toLowerCase().indexOf(originalFilter) > -1)))) 
            && (this.kunUbehandlede ? ega.commentOpen > 0 ? true : false : true)
            && (this.withNewComments ? (ega.commentNew > 0) ? true : false : true)
            && (this.withComments ? (ega.commentOpen > 0 || ega.commentClosed > 0) ? true : false : true)
            && (this.withPotentialTaxonChanges ? (ega.taxonChange == 2) ? true : false : true)
            && (this.withAutomaticNameChanges ? (ega.taxonChange == 1) ? true : false : true)
            && (this.kunMine ? (ega.lockedForEditByUser === auth.userName || ega.lastUpdatedBy === auth.userName) ? true : false : true)

            && (this.statusCheckboxFilter.length ? this.statusCheckboxFilter.some (s => ega.evaluationStatus === s && s != 'notStarted' ? true : (s === 'notStarted' && (ega.evaluationStatus === 'initial' || ega.evaluationStatus === 'created' || ega.evaluationStatus === 'createdbyloading')) ? true :false): true) 
            && (this.expertgroupCategoryCheckboxFilter.length ? this.expertgroupCategoryCheckboxFilter.some(s => !ega.category && s != 'NL'? false : !ega.category && s === 'NL' ? true: s.indexOf(ega.category.substring(0,2)) > -1) : true))) 
        //console.log (result)
            //this.expertgroupCategoryCheckboxFilter.length ? this.expertgroupCategoryCheckboxFilter.some(s => !ega.category && s != 'NL' ? false : !ega.category && s === 'NL' ? true: s.indexOf(ega.category.substring(0,2)) > -1) : true))
            //(this.expertgroupCategoryCheckboxFilter.length ? this.expertgroupCategoryCheckboxFilter.some(s => !ega.category && s != 'NL' ? false : !ega.category && s === 'NL' ? true: s.indexOf(ega.category.substring(0,2)) > -1) : true) ) )
           // && 
            //console.log(ega),
            // ((!ega.category && this.expertgroupCategoryCheckboxFilter.length) ? false : this.expertgroupCategoryCheckboxFilter.length ? this.expertgroupCategoryCheckboxFilter.some(s => s.indexOf(ega.category.substring(0,2)) > -1) : true))
            //this.expertgroupCategoryCheckboxFilter.length ? this.expertgroupCategoryCheckboxFilter.some(s => !ega.category && s != 'NL' ? false : !ega.category && s === 'NL' ? true: s.indexOf(ega.category.substring(0,2)) > -1) : true)
           // this.expertgroupCategoryCheckboxFilter.length ? true : false )
            //.searchStrings
                 //.some(s => s.indexOf(filter) > -1))                      
        return result
    }

    @computed get expertgroupAssessmentListStatistic() {
        const arr = this.expertgroupAssessmentList
        // const katFilter = this.expertgroupCategoryFilter.toLowerCase().replace(" ", "/")
        var tot = 0, ini = 0, prog = 0, fin = 0, oth = 0;
        for(var i = 0; i < arr.length; ++i){
            if(this.expertgroupCategoryCheckboxFilter.length > 0) {
                //if ((this.expertgroupCategoryCheckboxFilter.indexOf(arr[i].category) > -1) || (arr[i].category === null) || (arr[i].category === "")) {
                if ((arr[i].category && this.expertgroupCategoryCheckboxFilter.indexOf(arr[i].category.substring(0,2)) > -1) || ((arr[i].category === null || arr[i].category === "") && this.expertgroupCategoryCheckboxFilter.indexOf('Ingen kategori') > -1)) {
                //if ((arr[i].category && this.expertgroupCategoryCheckboxFilter.indexOf(arr[i].category.substring(0,2)) > -1) || (arr[i].category === null)) {                    
                    tot++
                    const stat = arr[i].evaluationStatus
                    if(stat === "inprogress") {
                        prog++
                    } else if(stat === "finished") { 
                        fin++
                    } else if(stat === "created" || stat === "initial" || stat === 'createdbyloading') { 
                        ini++
                    } else {
                        oth++
                    }
                }
            }
            
        /*if (!this.includeLC && !config.isRelease) {
             if (arr[i].category != "LC" && arr[i].category != "NE" && arr[i].category != "NA") {
                tot++
                const stat = arr[i].evaluationStatus
                if(stat === "inprogress") {
                    prog++
                } else if(stat === "finished") { 
                    fin++
                } else if(stat === "created" || stat === "initial" || stat === 'createdbyloading') { 
                 ini++
                } else {
                    oth++
                }
            }
       } */ else {
            tot++
                const stat = arr[i].evaluationStatus
                if(stat === "inprogress") {
                    prog++
                } else if(stat === "finished") { 
                    fin++
                } else if(stat === "created" || stat === "initial" || stat === 'createdbyloading') { 
                 ini++
                } else {
                    oth++
                }
        }
    } 
        const result = {
            total: tot,
            initial: ini,
            inprogress: prog,
            finished: fin,
            other: oth
        }
        return result
    }

    @action navigate(assessmentTabId, id) {
        console.log("navigate: " + assessmentTabId + " - " + id)
        action(() => {
            this.assessmentTabs.activeTab.id = assessmentTabId
            // this.assessmentId = id
        })
    }

    async setCurrentAssessment(id) {
        window.scrollTo(0,0)
        console.log("setCurrentAssessment: " + id)
        const intid = Number(id)
        if(intid === this.assessmentId)
            return; // do not get or change assessment when unless id is different
        let json = null
        if (id) {
            json = await this.getAssessment(id)
            if (json) {
                this.updateCurrentAssessment(json)
            }
        }
    }

    @action updateAssessmentSavedVersion(assessment) {
        if (assessment && assessment.id) {
            const assessmentStringCopy = JSON.stringify(assessment)
            const jsoncopy = JSON.parse(assessmentStringCopy)
            transaction(() => {
                this.assessmentSavedVersion = jsoncopy
                this.assessmentSavedVersionString = assessmentStringCopy
            })
        } else {
            throw "updateAssessmentSavedVersion: Something is seriously wrong" // Fail fast
        }
    }

    async saveCurrentAssessment() {
        events.trigger("saveAssessment", "savestart")
        const data = toJS(this.assessment)
        console.log("Y:" + JSON.stringify(data).length)
        const id = data.id
        const url = config.getUrl("assessment/") + id
        fetch(url, {
            method: 'POST',
            // mode: 'no-cors',
            body: JSON.stringify(data), // data can be `string` or {object}! (cant get it to work with {object}...)
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + auth.getAuthToken

            }
          })
        //   .then(res => res.json())
        //   .then(response => console.log('Success:', JSON.stringify(response)))
          .then(response => checkStatus(response))
          .then(() => this.updateAssessmentSavedVersion(data))
          .then(() => events.trigger("saveAssessment", "savesuccess"))
          .catch(error => 
            {events.trigger("saveAssessment", "savefailure")
             console.error('Error:', error)}
          );
    }

    // async loadKoder() {
    //     const json = await this.getKoder()
    //     const grupper = json.Children
    //     for (let key in grupper) {
    //         for (let obj of grupper[key]) 
    //         {
    //             obj.name = key
    //         }
    //     }
    //     const koder = observable.object(grupper)
    //     runInAction(() => this.koder = koder)
    // }

    // async loadPåvirkningsfaktorer() {
    //     const json = await this.getPåvirkningsfaktorer()
    //     const pvf = observable.object(json)
    //     runInAction(() => this.påvirkningsfaktorer = pvf)
    // }


    async loadExpertGroups() {
        const json = await this.getExpertGroups()
        // setter ekspertgrupper og fjerner Moser (Svalbard)
        const res = json.map(s => {return {value:s, text:s}}).filter(n => {return n.value != 'Moser (Svalbard)'}) // todo: remove this line when server data is correct       
        const expertgroups = observable.array(res)
        runInAction(() => this.expertgroups = expertgroups)
    }

    async loadExpertgroupAssessmentList(expertgroupId) {
        runInAction(() => this.loadingExpertGroup = true)
        const id = expertgroupId.replace('/','_')
        const url = config.getUrl("expertgroupassessments/") + id
        const expertgroupAssessments = await auth.getJsonRequest(url)

        console.log("------" + JSON.stringify(expertgroupAssessments))

        const role = expertgroupAssessments.rolle; // todo: implement functionality
        const assessments = observable.array(expertgroupAssessments.assessments)
        console.log("loded " + assessments.length + " assessments")
        runInAction(() => {
            this.expertgroupAssessmentList = assessments
            this.roleincurrentgroup = role
            this.loadingExpertGroup = false
        })
                
    }

    async loadCurrentExpertgroupAssessmentList() {
        const expertgroupId = this.expertgroup
        console.log("loadCurrentExpertgroupAssessmentList : " + expertgroupId)
        this.loadExpertgroupAssessmentList(expertgroupId)
    }
    

    // @action forceSyncWithCodes(assessment, codegroups) {
    //     this.criteriaWithCodes.map(tupple =>
    //         {
    //             const prop = tupple[0]
    //             const codekey = tupple[1]
    //             const codes = codegroups[codekey]
    //             if(codes == null) {
    //                 console.warn("forceSyncWithCodes: no codes for " + codekey)
    //             }
    //             console.log("-" + prop + "¤" + assessment[prop])
    //             if (assessment[prop] === []) {
    //                 console.log("*****")
    //             }
    //             const existingCode = codes.find(code => code.value === assessment[prop])
    //             if (existingCode === undefined ) {
    //                 assessment[prop] = codes[0].value
    //             }
    //         }
    //     )
    // }

    @action addSelectedPåvirkningsfaktor() {
        const påv = toJS(this.selectedPåvirkningsfaktor)
        const existing = this.assessment.påvirkningsfaktorer.find(item =>
            item.id == påv.id)
        if(existing) {
            // console.log("existing:" + JSON.stringify(existing))
            this.assessment.påvirkningsfaktorer.remove(existing)
        }
        this.assessment.påvirkningsfaktorer.push(påv)
        this.clearSelectedPåvirkningsfaktor()        
    }

    @action removeSelectedPåvirkningsfaktor(påv) {
        //const påv = this.selectedPåvirkningsfaktor

        this.assessment.påvirkningsfaktorer.remove(påv)
        console.log("Removed " + påv.beskrivelse)
    }

    @action editPåvirkningsfaktor(påv) {
        console.log("Edit " + JSON.stringify(påv))

        transaction(() => {
            const sp = this.selectedPåvirkningsfaktor
            sp.id = påv.id
            sp.forkortelse = påv.forkortelse
            sp.overordnetTittel = påv.overordnetTittel
            sp.beskrivelse = påv.beskrivelse
            sp.tidspunkt = påv.tidspunkt
            sp.omfang = påv.omfang
            sp.alvorlighetsgrad = påv.alvorlighetsgrad
            sp.comment = påv.comment
        })
    }


    @action updateCurrentAssessment(json) {
        // console.log("updateCurrentAssessment: " + JSON.stringify(json))
        const codegroups = this.koder
        if (!codegroups) {
            throw "Codes not loaded" // Fail fast
        }

        if (json && json.id) {
            const id = Number(json.id)
            // const assessment = observable.object(json)
            const assessmentStringCopy = JSON.stringify(json)
            const jsoncopy = JSON.parse(assessmentStringCopy)

             const assessment = observable.object(jsoncopy)


            // enhanceWithRiskEvaluation(assessment)

            enhanceAssessment(assessment, this)

            this.navigate(1)
            runInAction(() => {
                this.assessmentSavedVersion = json
                this.assessmentSavedVersionString = assessmentStringCopy
                this.assessment = assessment
                this.assessmentId = id
            })
        } else {
            this.navigate(1)
            runInAction(() => {
                this.assessmentSavedVersion = null
                this.assessmentSavedVersionString = ""
                this.assessment = null
                this.assessmentId = null
            })
        }
    }

    @action createNewAssessment(taxinfo) {
        console.log("opprett ny vurdering: " + taxinfo.ScientificName + " " + taxinfo.ScientificNameId + " " + taxinfo.Ekspertgruppe)
        const url = config.getUrl("assessment/createnew") 
        fetch(url, {
            method: 'POST',
            // mode: 'no-cors',
            body: JSON.stringify(taxinfo),
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + auth.getAuthToken
            }
          })
          .then(response => checkStatus(response))
          .then(() => events.trigger("saveAssessment", "savesuccess"))
          .then(() => this.loadCurrentExpertgroupAssessmentList())
          .then(() => this.viewMode = "choosespecie")
          
        //   .then((responsdata) => {if (responsdata && responsdata.message) alert(responsdata.message)})
        .catch(error => 
            {events.trigger("saveAssessment", "savefailure")
             console.error('Error:', error)}
        );
    }

    @action moveAssessment(taxinfo) {
        const id = this.assessmentId
        console.log("flytt vurdering til nytt navn: " + taxinfo.ScientificName + " " + taxinfo.ScientificNameId + " " + taxinfo.Ekspertgruppe)
        console.log(id + " - " + JSON.stringify(taxinfo))
        const url = config.getUrl("assessment/" + id + "/move") 
        fetch(url, {
            method: 'POST',
            // mode: 'no-cors',
            body: JSON.stringify(taxinfo),
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + auth.getAuthToken
            }
          })
          .then(response => checkStatus(response))
          .then(() => events.trigger("saveAssessment", "savesuccess"))
          .then(() => this.loadCurrentExpertgroupAssessmentList())
          .then(() => action(() => this.viewMode = "choosespecie")())
          //   .then((responsdata) => {if (responsdata && responsdata.message) alert(responsdata.message)})
        .catch(error => 
            {events.trigger("saveAssessment", "savefailure")
             console.error('Error:', error)}
        );
    }

    checkForExistingAssessment = (sciName, assessmentId) => {
        //this.expertgroupAssessmentList.map(ega => console.log( ega.scientificName))
        const result = this.expertgroupAssessmentList.some(ega => ega.scientificName == sciName && ega.id != assessmentId)
        //console.log("sciname:" + sciName + " " + result)
    
        return result
    }

    //getAssessment = flow(function * (assessmentId) {
    async getAssessment(assessmentId) {
        const url = config.getUrl("assessment/") + assessmentId
        //console.log("assessmentId: " + assessmentId)
        // try {
        const response = await fetch(url
            , {
                method: 'GET',
                // mode: 'no-cors',
                headers: new Headers( {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + auth.getAuthToken
                })
            }
        ).then((response) => {
            if (response.status >= 400 && response.status < 600) {
                throw new Error("Bad response from server");
            }
            return response;
        }).then((returnedResponse) => {
            // Your response to manipulate
            //    const json = await returnedResponse.json()
            return returnedResponse;

        }).catch((error) => {
            // Your error is here!
            console.log(error)
        });

        const json = await response.json()
        return json
    }

    open(assessmentInfo) {	
        // console.log("########################" + JSON.stringify(assessmentInfo))
        // console.log("########################" + assessmentInfo.id)
        this.setCurrentAssessment(assessmentInfo.id)	
    }

     lockFraHode(v) {
        loadData(
            config.getUrl("assessment/"+v.id+ "/lock"),
            data => {
                // Now open the locked assessment
                runInAction(()=>this.assessmentId = v.id)
                this.loadExpertgroupAssessmentList(this.expertgroup)
            },
            error => alert("Feil ved låsing:" +error)
        )
    }

    unlockFraHode(v) {
        loadData(
            config.getUrl("assessment/"+v.id+ "/unlock"),
            data => {
                this.loadExpertgroupAssessmentList(this.expertgroup)
            },
            error => alert("Feil ved opplåsing:" +error)
        )
    }

    // async getKoder() {
    //     const url = config.getUrl("Kode/101")  //todo: this is temporory to test new kode format
    //     const response = await fetch(url)
    //     const json = await response.json()
    //     return json
    // }
    // async getPåvirkningsfaktorer() {
    //     const url = config.getUrl("Kode/2")
    //     const response = await fetch(url)
    //     const json = await response.json()
    //     return json
    // }
    async getExpertGroups() {

        const url = config.getUrl("expertgroups")
        console.log("getExpertGroups: " + url )

        const response = await fetch(url)
        const json = await response.json()
        console.log("getExpertGroups: " + JSON.stringify(json) )

        return json
    }

    async getExpertGroupAssessmentList(expertgroupId) {
        const id = expertgroupId.value.replace('/','_')
        const url = config.getUrl("expertgroupassessments/") + id

        const response = await fetch(url)
        const json = await response.json()
        //console.log("getExpertGroupAssessmentList: " + JSON.stringify(json))
        return json
    }

    initializeServices() {
        console.log("start initializeServices")
        // this.loadKoder()
        // this.loadPåvirkningsfaktorer()
        this.loadExpertGroups()
    }


    async finishCurrentAssessment(statusaction) {
        const id = this.assessment.id
        const url = config.getUrl("assessment/") + id +"/" + statusaction
        fetch(url, {
            method: 'GET',
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + auth.getAuthToken

            }
          })
          .then(() => console.log("Do the finishing touches"))
          .then(() => this.finishassessment(statusaction, this.assessment))
          .then(() => events.trigger("saveAssessment", "savesuccess"))
          .then(() => this.loadCurrentExpertgroupAssessmentList())
          .catch(error => 
            {events.trigger("saveAssessment", "savefailure")
            console.error('Error:', error)}
          );
  

        
    }

    @action finishassessment(statusaction, assessment) {
        let status = statusaction === "finish" ? "finished" : statusaction === "unfinish" ? "inprogress" : ""
        let username = statusaction === "unfinish" ? auth.userName : null
        let now = Date.now().toString()
        transaction(() => {
            assessment.evaluationStatus = status
            assessment.lockedForEditAt = now
            assessment.lockedForEditByUser = username
            assessment.lastUpdatedOn = now
        })

        if(statusaction === "unfinish") {
            this.viewMode = "choosespecie"
            this.updateCurrentAssessment(null)
        } else {
            this.updateAssessmentSavedVersion(assessment)
        }

    }


    // @action updateAssessmentStatus(status) {
    //     this.assessment.evaluationStatus = status
    //     this.finishCurrentAssessment("finish")
    // }
  
    @action setAssessmentComplete(statusaction) {
        if (!this.roleincurrentgroup.leder) {
            alert("setAssessmentComplete: 'Not allowed'")
            return
        }
        if (statusaction !== "finish" && statusaction !== "unfinish" )
        {
            alert("Wrong statusaction: " + statusaction)
        }
        // const status = statusaction === "finish" ? "finished" : "inprogress"  // ???
        // this.assessment.evaluationStatus = status

        this.finishCurrentAssessment(statusaction)
    }

    @action copyThisAssessmentToTestarter() {
        if (!this.roleincurrentgroup.leder) {
            console.warn("copyThisAssessmentToTestarter: 'Not allowed'")
            alert("copyThisAssessmentToTestarter: 'Not allowed'")
            return
        }
        const id = this.assessment.id
        const url = config.getUrl("assessment/") + id +"/copytotestarter"
        fetch(url, {
            method: 'GET',
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + auth.getAuthToken

            }
          })
          .catch(error => 
            {console.error('Error:', error)}
          );
    }


    koder2migrationPathways(mp) {
        const r = {}
        r.name = mp.Text
        // console.log(r.name)
        r.value = mp.Value
        if(mp.Children) {
            r.children = []
            const mpckey = Object.keys(mp.Children)[0]
            const mpc = mp.Children[mpckey]
            for ( var i = 0; i < mpc.length; ++i )
            {
                r.children.push(this.koder2migrationPathways(mpc[i]));
            }
        }
        return r
    }



    
}
export default new ViewModel()