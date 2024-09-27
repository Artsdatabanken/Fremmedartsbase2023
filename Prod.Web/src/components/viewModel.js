import {
  action,
  autorun,
  computed,
  extendObservable,
  makeObservable,
  observable,
  reaction,
  runInAction,
  transaction
} from "mobx";
import { router } from "./routeMatcher";
import events from "./event-pubsub";
// import {HttpTransportType, HubConnectionBuilder, JsonHubProtocol, LogLevel} from "@microsoft/signalr"
import * as signalR from "@microsoft/signalr";
// import enhanceWithRiskEvaluation from "./CategoryCriteria"
// import {codes2labels} from '../utils'
import config from "../config";
import auth from "./authService";
import createContext from "./createContext";
import errorhandler from "./errorhandler";
import enhanceAssessment from "./assessment/enhanceAssassment.js";
import { checkStatus, loadData } from "../apiService";
import tabdefs from "./tabdefs";
import assessmentTabdefs from "./assessment/assessmentTabdefs";
import { codeLists, isTrueteogsjeldnenaturtype } from "./codeLists";

// import { any } from 'prop-types'
// import { Console } from 'console'
// import { ConfigurationManager } from '../../dist/Prod.Web.e31bb0bc'

class ViewModel {
  constructor() {
    makeObservable(this, {
      navigate: action,
      isServicesReady: computed,
      isLockedByMe: computed,
      isFinnished: computed,
      harVurdering: computed,
      updateAssessmentSavedVersion: action,
      updateCurrentAssessment: action,
      finishassessment: action,
      setAssessmentComplete: action,
      AssessmentReportLink: computed,
      createNewAssessment: action,
      moveAssessmentScientificName: action,
      copyThisAssessmentToTestarter: action,
      isDirty: computed
    });

    const options = {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
      logMessageContent: true,
      logger: signalR.LogLevel.Trace,
      //accessTokenFactory: () => this.props.accessToken,  // todo: <---- check this
    };

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
        readonly: false,
      },
      koder: null,
      codeLabels: null,
      naturtypeLabels: {},
      livsmediumLabels: null,
      livsmediumCodes: null,
      trueteogsjeldneCodes: null,
      naturtyperNIN2: null,

      comments: [],
      newComment: null,
      newComments: [],
      otherComments: [],
      withComments: false,
      withNewComments: false,
      withPotentialTaxonChanges: false,
      withAutomaticNameChanges: false,
      kunUbehandlede: false,
      hSStatus: false,
      kunMine: false,
      includeLC: false,
      showTheCat: false,

      artificialAndConstructedSites: [
        "F4",
        "F5",
        "H4",
        "L7",
        "L8",
        "M14",
        "M15",
        "T35",
        "T36",
        "T37",
        "T38",
        "T39",
        "T40",
        "T41",
        "T42",
        "T43",
        "T44",
        "T45",
        "V11",
        "V12",
        "V13",
      ],
      assessmentTypeFilter: "riskAssessment",

      expertgroups: null, // [],
      expertgroup: null,
      roleincurrentgroup: null,
      expertgroupAssessmentList: [],
      expertgroupAssessmentTotalCount: 0,
      expertgroupAssessmentFilterCount: 0,
      expertgroupAssessmentAuthors: [],
      assessmentsStatistics: observable,
      expertgroupAssessmentFilter: "",
      expertgroupCategoryFilter: "",
      expertgroupCategoryCheckboxFilter: [],
      statusCheckboxFilter: [],

      filterType: [],
      workStatus: [],
      currentFilter: {
        decisiveCriteriaFilter: [],
        riskCategoryFilter: [],
        riskAssessedFilter: [],
        riskNotAssessedFilter: [],
        vurdert: false,
        ikkevurdert: false,
      },
      historyFilter: {
        decisiveCriteriaFilter: [],
        riskCategoryFilter: [],
        riskAssessedFilter: [],
        riskNotAssessedFilter: [],
        vurdert: false,
        ikkevurdert: false,
      },

      horizonScanFilter: {
        // horizonFilters: false,
        hsNotStarted: false,
        hsFinished: false,
        toAssessment: false,
        notAssessed: false,
        potentialDoorKnockers: [],
        notAssessedDoorKnocker: [],
      },

      responsible: [], // list of lastupdatedbypeople
      ekspertgruppeReport: null,
      lockedForEditByUser: null,
      assessmentIsSaving: false,
      showSaveSuccessful: false,
      showSaveFailure: false,
      antallVurderinger: 0,
      antallUbehandlede: 0,
      antallTaxonEndring: 0,
      antallNavnEndret: 0,
      loadingExpertGroup: false,

      // NB! evaluationContext also exist on the assessment. This one is for general taxonSearch, maps++
      evaluationContext: "N",
      //todo: this thing should go to the code file
      evaluationContexts: {
        N: {
          name: "Norge",
          nameWithPreposition: "i Norge",
          map: "norge",
        },
        S: {
          name: "Svalbard",
          nameWithPreposition: "på Svalbard",
          map: "svalbard",
        },
      },

      livsmediumEnabled: true, // just a manual flag!
      spredningsveier: null,
      token: null,

      // ************************************************
      // ********  Assessment props *********************
      // ************************************************

      //todo: test if this is actually in use!! artskartModel is also defined(?) on the assessment, which is where it should be!
      // artskartModel: {},

      // påvirkningsfaktorer: [],
      // selectedPåvirkningsfaktor: {
      //     id: null,
      //     forkortelse: null,
      //     overordnetTittel: null,
      //     beskrivelse: null,
      //     tidspunkt: null,
      //     omfang: null,
      //     alvorlighetsgrad: null,
      //     comment: null
      // },

      // statusChange: false
    });

    const url = "https://artskart.artsdatabanken.no/appapi/api/token/gettoken";
    const thirtyMinutes = 30 * 60 * 1000;
    const downloadToken = async function downloadToken(self) {
      //   window.setTimeout(downloadToken(self), thirtyMinutes);
      try {
        const result = await fetch(url);
        const t = await result.text();
        self.token = JSON.parse(t); //              return JSON.parse(t);
        console.log("got new token" + t);
      } catch (err) {
        console.error("token troubles", url, err);
        return {};
      }
    };

    downloadToken(this);
    window.setInterval(downloadToken, thirtyMinutes, this);

    this.initializeServices();
    // ---------------
    Object.assign(this, codeLists);
    this.isTrueteogsjeldnenaturtype = isTrueteogsjeldnenaturtype;

    // // // const codes = require('../FA3CodesNB.json')
    // // // this.koder = codes.Children
    // // // const clabels =  codes2labels(this.koder.labels[0].Children)
    // // // this.codeLabels = clabels

    // // // // load livsmedium codes ----
    // // // const ninlm = require('../nin-livsmedium.json')
    // // // const lm = this.transformlivsmedium(ninlm)
    // // // // console.log("livsmedium2nt: " +  JSON.stringify(lm))
    // // // const lmlabels = this.transformlivsmediumlabels(ninlm, {})
    // // // // console.log(JSON.stringify(lmlabels))
    // // // const grupper = lm.Children
    // // // this.livsmediumLabels = lmlabels
    // // // this.livsmediumCodes = grupper
    // // // // --------------------------

    // // // // load truede naturtyper codes ----
    // // // const togsnt = require('../TrueteOgSjeldneNaturtyper2018.json')
    // // // const nt = this.transformtrueteogsjeldnenaturtyper(togsnt)
    // // // // console.log("trueteogsjeldnenaturtyper: " +  JSON.stringify(nt))
    // // // const tsgrupper = nt.Children
    // // // this.trueteogsjeldneCodes = tsgrupper

    // // // this.trueteogsjeldnenaturtypercodes = []
    // // // this.gettrueteogsjeldnenaturtypercodes(togsnt)
    // // // console.log("!!! gettrueteogsjeldnenaturtypercodes" + JSON.stringify(this.trueteogsjeldnenaturtypercodes))

    // // // // --------------------------

    // // // // load NiN2 codes ----
    // // // const nin2root = require('../Nin2_3.json')
    // // // // console.log("nin2naturtyper: " +  JSON.stringify(nin2root))
    // // // const nin2grupper = nin2root.Children
    // // // this.naturtyperNIN2 = nin2grupper

    // // // const nin2codes = this.koder.naturtyperNIN2
    // // // const nin2 = this.transformnaturtyperNIN2(nin2codes)
    // // // // console.log("nin2 transformed: " +  JSON.stringify(nin2))
    // // // // const nin2grupper = nin2.Children
    // // // // this.naturtyperNIN2 = nin2grupper
    // // // // --------------------------
    // // // this.nin2codes = nin2codes

    // // // // console.log("labels keys: " + JSON.stringify(Object.keys(clabels)))
    // // // // console.log("codes keys: " + JSON.stringify(Object.keys(codes.Children)))
    // // // // console.log("codes json: " + JSON.stringify(codes))
    // // // // console.log("----------------------------------------------+++")
    // // // // console.log(JSON.stringify(clabels))

    // // // //-----------------------------------------------------

    // // // const mp = this.koder.migrationPathways[0]
    // // // this.spredningsveier = this.koder2migrationPathways(mp)
    // // // //-----------------------------------------------------

    this.theUserContext = createContext(this.userContext);

    //***** pubsub event handlers *****
    let savetimer = null;
    events.on("saveAssessment", (tag) => {
      if (tag === "savestart") {
        console.log("save vurdering starter");
        action(() => (this.assessmentIsSaving = true))();
        savetimer = setTimeout(
          () => events.trigger("saveAssessment", "timeout"),
          30000
        );
        console.log("save vurdering starter -");
      } else if (tag === "timeout") {
        console.log("save vurdering timeout");
        action(() => (this.assessmentIsSaving = false))();
      } else if (tag === "savesuccess") {
        clearTimeout(savetimer);
        console.log("save vurdering successfull");
        action(() => (this.assessmentIsSaving = false))();
        action(() => (this.showSaveSuccessful = true))();
        setTimeout(() => {
          action(() => (this.showSaveSuccessful = false))();
        }, 3000);
        console.log("save vurdering successfull -");
      } else if (tag === "savefailure") {
        clearTimeout(savetimer);
        console.log("save vurdering failure");
        action(() => (this.assessmentIsSaving = false))();
        action(() => (this.showSaveFailure = true))();
        setTimeout(() => {
          action(() => (this.showSaveFailure = false))();
        }, 3000);
        console.log("save vurdering failure -");
      }
    });

    events.on("assessment", (tag) => {
      if (tag === "open") {
        console.log("signalR: *open*");
      } else if (tag === "save") {
        console.log("signalR: *save*");
      }
    });
    //*************************************************

    // autorun(() => {
    //     console.log("selectedPåvirkningsfaktor: " + (this.selectedPåvirkningsfaktor ? this.selectedPåvirkningsfaktor.id : "None"))
    // });

    // **** set assessment and assessmentId ****
    reaction(
      () => this.assessmentId,
      (assessmentId) => {
        console.log(
          "x: " +
            this.assessmentId +
            " " +
            typeof this.assessmentId +
            " " +
            (this.assessment ? this.assessment.id : "nix")
        );
        if (assessmentId) {
          this.setCurrentAssessment(assessmentId);
        } else {
          this.setCurrentAssessment(null);
          action(() => (this.viewMode = "choosespecie"));
        }
      }
    );
    reaction(
      () => this.assessmentId,
      async (assessmentId) => {
        console.log("ny assessmentId: " + assessmentId);
      }
    );
    autorun(() => {
      if (this.viewMode === "choosespecie") {
        this.setCurrentAssessment(null);
      }
    });
    reaction(
      () => this.assessment,
      (assessment) => {
        console.log(
          assessment ? "ny assessment: " + assessment.id : "no assessment"
        );
        if (assessment && this.isServicesReady) {
          // console.log("viewMode = 'assessment' - before:" + this.viewMode)
          this.viewMode = "assessment";
        }
      }
    );
    // ***************************************

    // **** sett expert group ****
    reaction(
      () => [
        this.expertgroup,
        auth.isLoggedIn,
        this.assessmentTypeFilter,
        this.expertgroupAssessmentFilter,
        this.horizonScanFilter.notAssessedDoorKnocker.length,
        this.horizonScanFilter.potentialDoorKnockers.length,
        this.horizonScanFilter.hsNotStarted,
        this.horizonScanFilter.hsFinished,
        this.horizonScanFilter.toAssessment,
        this.horizonScanFilter.notAssessed,
        this.responsible.length,
        this.kunUbehandlede,
        this.hSStatus,
        this.workStatus.length,
        this.otherComments.length,

        this.historyFilter.riskCategoryFilter.length,
        this.historyFilter.decisiveCriteriaFilter.length,
        this.historyFilter.riskAssessedFilter.length,
        this.historyFilter.riskNotAssessedFilter.length,
        this.historyFilter.ikkevurdert,
        this.historyFilter.vurdert,

        this.currentFilter.riskCategoryFilter.length,
        this.currentFilter.decisiveCriteriaFilter.length,
        this.currentFilter.riskAssessedFilter.length,
        this.currentFilter.riskNotAssessedFilter.length,
        this.currentFilter.ikkevurdert,
        this.currentFilter.vurdert,
      ],
      ([expertgroupId, isLoggedIn]) => {
        //console.log("react to expertgroup: " + expertgroupId + "," + isLoggedIn)
        if (isLoggedIn && expertgroupId) {
          this.loadCurrentExpertgroupAssessmentList();
        } else {
          this.expertgroupAssessmentList = [];
        }
      }
    );
    // ***************************************

    autorun(() => {
      console.log("har vurdering: " + this.harVurdering);
    });

    // **** initialize tabs ****
    extendObservable(this, tabdefs(this));
    assessmentTabdefs(this);
    // **** end initialize tabs ****

    const createRoutes = (tablist) => {
      const items = [];
      tablist.forEach((tabitem) => {
        const item = [
          tabitem.url + "/:id",
          (params) => this.navigate(tabitem.id, params.id),
        ];
        items.push(item);
      });
      return items;
    };

    const routes = createRoutes(this.assessmentTabs.tabList);

    autorun(() => {
      if (this.router && this.assessmentTabs) {
        const hash = this.router.hash.substr(1); // when user changes the url hash -
        router(hash, routes); // - then navigate
      }
    });

    autorun(() => {
      // **** Lurer Mobx til å kjøre koden... TODO: Gjør dette på en "riktig" måte ****
      this._viewMode = this.viewMode;
      this._assessment = this.assessment;

      this._evaluationStatus =
        !this.assessment || this.assessment.evaluationStatus;
      // ******************************************************************************
      runInAction(() => {
        const lockedUserId = !this.assessment
          ? null
          : this.assessment.lockedForEditByUserId;
        const isLockedByMe = lockedUserId === auth.userId;
        this.userContext.readonly =
          this.viewMode === "assessment" &&
          (!isLockedByMe || this.assessment.evaluationStatus === "finished");
      });
      if (this.expertgroupAssessmentList) {
        let list = this.expertgroupAssessmentList;
        let countTotal = 0;
        let countOpen = 0;
        let countNew = 0;
        let countTaxon = 0;
        let countName = 0;
        list.forEach((row) => {
          if (row.commentClosed > 0 || row.commentOpen > 0) {
            countTotal++;
          }
          if (row.commentOpen > 0) {
            countOpen++;
          }
          if (row.commentNew > 0) {
            countNew++;
          }
          if (row.taxonChange == 2) {
            countTaxon++;
          }
          if (row.taxonChange == 1) {
            countName++;
          }
        });
        action(() => {
          this.antallVurderinger = countTotal;
          this.antallUbehandlede = countOpen;
          this.antallNye = countNew;
          this.antallTaxonEndring = countTaxon;
          this.antallNavnEndret = countName;
        })();
      }
    });
    autorun(() => {
      console.log("isServicesReady: " + this.isServicesReady);
      console.log("exp" + (this.expertgroups != null));
    });
    autorun(() => {
      console.log("dirty: " + this.isDirty);
    });
    autorun(() => {
      console.log("viewMode: " + this.viewMode);
    });

    // #######################################################################################################
    // #######################################################################################################
    // ##################################  assessment reactions  #############################################
    // #######################################################################################################
    // #######################################################################################################

    // autorun(() => {
    //     if(this.assessment && this.assessment.speciesStatus == "C3") {
    //         runInAction(() => this.assessment.speciesEstablishmentCategory = "C3")
    //     }
    // })
    // autorun(() => {
    //     if(this.assessment && this.assessment.speciesStatus) {
    //         reaction(
    //             () => this.assessment.speciesStatus,
    //             (speciesStatus, previousSpeciesStatus) => {
    //                 if (speciesStatus === "C3" && previousSpeciesStatus !== "C3") {
    //                     // console.log("¤¤¤ reset speciesEstablishmentCategory")
    //                     if(!this.assessment.speciesEstablishmentCategory) {
    //                         runInAction(() => this.assessment.speciesEstablishmentCategory = "C3")
    //                     }
    //                 }
    //             }
    //         )
    //     }
    // })
    // autorun(() => {
    //     if(this.assessmentTabs && this.assessmentTabs.activeTab ) {
    //         console.log("current assessmentTab: " + this.assessmentTabs.activeTab.id )
    //     }
    // });
    // autorun(() => {
    //     console.log("skal vurderes: " + this.skalVurderes)
    // });
    // #######################################################################################################
    // #######################################################################################################
  } // ########### end constructor ###########
  //    #######################################

  get UserContext() {
    return this.theUserContext;
  }

  initializeServices() {
    console.log("start initializeServices");
    // this.loadKoder()
    // this.loadPåvirkningsfaktorer()
    this.loadExpertGroups();
  }

  // todo: of some unknown reason this does not seem to work. It is currently used only in routing, so it is not critical
  navigate(assessmentTabId, id) {
    console.log(
      "navigate: " + this.assessmentTabs.activeTab.id + " to:" + assessmentTabId
    );
    const that = this;
    action(() => {
      that.assessmentTabs.activeTab.id = assessmentTabId;
      // this.assessmentId = id
    });
    console.log("navigate set: " + this.assessmentTabs.activeTab.id);
  }

  get isServicesReady() {
    return this.expertgroups != null;
    // this.koder != null &&
    // this.expertgroups != null &&
    // this.codeLabels != null)
  }

  get isLockedByMe() {
    if (!this.assessment) return false;
    return this.assessment.lockedForEditByUser === auth.userId;
  }

  get isFinnished() {
    if (!this.assessment) return false;
    return (
      this.assessment.evaluationStatus &&
      this.assessment.evaluationStatus === "finished"
    );
  }

  get harVurdering() {
    return !!this.assessment;
  }

  // @computed get unresolvedComments() {
  //     const comments = this.assessmentComments
  //     const unresolvedComments = comments.filter(comment => !comment.resolved)
  //     const count = unresolvedComments.count
  //     return count
  // }

  // ################ Start section expert groups ##################
  async loadExpertGroups() {
    const json = await this.getExpertGroups();
    // setter ekspertgrupper og fjerner Moser (Svalbard)
    const res = json
      .map((s) => {
        return { value: s, text: s };
      })
      .filter((n) => {
        return n.value != "Moser (Svalbard)";
      }); // todo: remove this line when server data is correct
    const expertgroups = observable.array(res);
    runInAction(() => (this.expertgroups = expertgroups));
  }

  async loadCurrentExpertgroupAssessmentList() {
    const expertgroupId = this.expertgroup;
    console.log("loadCurrentExpertgroupAssessmentList : " + expertgroupId);

    this.loadExpertgroupAssessmentList(expertgroupId);
  }
  // ################ End section expert groups ##################

  // ################ Start section current assessment ##################
  async setCurrentAssessment(id) {
    window.scrollTo(0, 0);
    console.log("setCurrentAssessment: " + id);

    const intid = Number(id);
    if (intid === this.assessmentId) return; // do not get or change assessment when unless id is different
    let json = null;
    if (id) {
      json = await this.getAssessment(id);

      if (json) {
        this.updateCurrentAssessment(json);
      }
    }
  }

  updateAssessmentSavedVersion(assessment) {
    if (assessment && assessment.id) {
      const assessmentStringCopy = JSON.stringify(assessment, undefined, 2);
      const jsoncopy = JSON.parse(assessmentStringCopy);
      runInAction(() => {
        this.assessmentSavedVersion = jsoncopy;
        this.assessmentSavedVersionString = assessmentStringCopy;
      });
    } else {
      throw "updateAssessmentSavedVersion: Something is seriously wrong"; // Fail fast
    }
  }

  updateCurrentAssessment(json) {
    // that is: open new assessment (and replace current) with data from server
    // console.log("updateCurrentAssessment: " + JSON.stringify(json))
    const codegroups = this.koder;
    if (!codegroups) {
      throw "Codes not loaded"; // Fail fast
    }

    if (json && json.id) {
      const id = Number(json.id);
      console.log("type of id : " + typeof id);
      const jsonnew = JSON.parse(JSON.stringify(json));
      const assessment = enhanceAssessment(jsonnew, this);
      const assessmentStringCopy = assessment.toJSON;
      const assessmentcopy = JSON.parse(assessmentStringCopy);

      runInAction(() => {
        this.assessmentSavedVersion = assessmentcopy;
        this.assessmentSavedVersionString = assessmentStringCopy;
        this.assessment = assessment;
        this.assessmentId = id;
        this.assessmentTabs.activeTab.id = assessment.horizonDoScanning ? 0 : 1;
      });
      // this.navigate(assessment.horizonDoScanning ? 0 : 1)
    } else {
      runInAction(() => {
        this.assessmentSavedVersion = null;
        this.assessmentSavedVersionString = "";
        this.assessment = null;
        this.assessmentId = null;
        this.assessmentTabs.activeTab.id = 1;
      });
      // this.navigate(assessment.horizonDoScanning ? 0 : 1)
    }
  }

  open(assessmentInfo) {
    // used by the selectAssessmentTable
    // console.log("########################" + JSON.stringify(assessmentInfo))
    // console.log("########################" + assessmentInfo.id)
    this.setCurrentAssessment(assessmentInfo.id);
    //this.assessmentTypeFilter == "horizonScanning" ?  this.assessmentTabs.activeTab.id = 0 :  this.assessmentTabs.activeTab.id = 1
  }

  // assessmentExists(
  //     expertgroup,
  //     scientificNameId,
  //     ) {
  //     const url = "assessment/ExistsByExpertgroupAndName/" + expertgroup + "/" + scientificNameId
  //     if (expertgroup  && scientificNameId) {
  //         loadData(
  //             config.getUrl(url),
  //             (data) => {
  //                 if (data) {
  //                     console.log("----" + JSON.stringify(data, undefined, 2))
  //                 } else {console.warn("----= nothing")}
  //             }
  //         )
  //     }
  // }

  checkForExistingAssessment = (expertgroup, scientificNameId) => {
    return new Promise((resolve, reject) => {
      const url =
        "assessment/ExistsByExpertgroupAndName/" +
        expertgroup +
        "/" +
        scientificNameId;
      if (!expertgroup || !scientificNameId) {
        reject("checkForExistingAssessment missing required parameter");
      }
      loadData(config.getUrl(url), (data) => {
        if (typeof data === "boolean") {
          // console.log("----" + JSON.stringify(data, undefined, 2))
          resolve(data);
        } else {
          reject("ExistsByExpertgroupAndName - no data");
        }
      });
    });
  };

  // checkForExistingAssessment = (sciName, assessmentId) => {
  //     //this.expertgroupAssessmentList.map(ega => console.log( ega.scientificName))
  //     const result = this.expertgroupAssessmentList.some(ega => this.findSciName(ega.scientificName) == sciName && ega.id != assessmentId)
  //     //console.log("sciname:", sciName, result)
  //     return result
  // }

  // findSciName = (name) => {
  //     const dividedName = name.split(" ")
  //     const result = dividedName[0] + " " + dividedName[1]
  //     return result
  // }

  finishassessment(statusaction, assessment) {
    let status =
      statusaction === "finish"
        ? "finished"
        : statusaction === "unfinish"
        ? "inprogress"
        : "";
    let userId = statusaction === "unfinish" ? auth.userId : null;
    let now = Date.now().toString();
    transaction(() => {
      assessment.evaluationStatus = status;
      assessment.lockedForEditAt = now;
      assessment.lockedForEditByUser = userId;
      assessment.lastUpdatedOn = now;
    });

    if (statusaction === "unfinish") {
      this.viewMode = "choosespecie";
      this.updateCurrentAssessment(null);
    } else {
      this.updateAssessmentSavedVersion(assessment);
    }
  }

  setAssessmentComplete(statusaction) {
    // console.log("#%% ferdigstill")
    if (!this.roleincurrentgroup.writeAccess) {
      alert("setAssessmentComplete: 'Not allowed'");
      return;
    }
    if (statusaction !== "finish" && statusaction !== "unfinish") {
      alert("Wrong statusaction: " + statusaction);
      return;
    }
    if (statusaction === "finish" && errorhandler.hasErrors) {
      // console.log("#%% kanikke")
      alert("Kan ikke ferdigstille. Vurderingen er ikke korrekt!");
      return;
    }

    // const status = statusaction === "finish" ? "finished" : "inprogress"  // ???
    // this.assessment.evaluationStatus = status

    this.finishCurrentAssessment(statusaction);
  }
  // ################ end section current assessment ##################

  // // // koder2migrationPathways(mp) {
  // // //     const r = {}
  // // //     r.name = mp.Text
  // // //     // console.log(r.name)
  // // //     r.value = mp.Value
  // // //     if(mp.Children) {
  // // //         r.children = []
  // // //         const mpckey = Object.keys(mp.Children)[0]
  // // //         const mpc = mp.Children[mpckey]
  // // //         for ( var i = 0; i < mpc.length; ++i )
  // // //         {
  // // //             r.children.push(this.koder2migrationPathways(mpc[i]));
  // // //         }
  // // //     }
  // // //     return r
  // // // }

  // // // transformlivsmedium(mp) {
  // // //     const r = {}
  // // //     r.Id = mp.Id
  // // //     r.Value = mp.Id
  // // //     // console.log(r.name)
  // // //     r.Text = mp.navn
  // // //     r.Collapsed = true
  // // //     r.Children = []
  // // //     if(mp.children) {
  // // //         for ( var i = 0; i < mp.children.length; ++i )
  // // //         {
  // // //             r.Children.push(this.transformlivsmedium(mp.children[i]));
  // // //         }
  // // //     }
  // // //     return r
  // // // }

  // // // transformlivsmediumlabels(mp, acc) {
  // // //     acc[mp.Id] = mp.navn
  // // //     if(mp.children) {
  // // //         for ( var i = 0; i < mp.children.length; ++i )
  // // //         {
  // // //             this.transformlivsmediumlabels(mp.children[i], acc)
  // // //         }
  // // //     }
  // // //     return acc
  // // // }

  // // // transformtrueteogsjeldnenaturtyper(nt) {
  // // //     return nt
  // // // }

  // // // gettrueteogsjeldnenaturtypercodes(nt) {
  // // //     this.trueteogsjeldnenaturtypercodes.push("NA " + nt.Value)
  // // //     if(nt.Children) {
  // // //         for ( var i = 0; i < nt.Children.length; ++i )
  // // //         {
  // // //             this.gettrueteogsjeldnenaturtypercodes(nt.Children[i])
  // // //         }
  // // //     }
  // // //     // console.log("!!! trueteogsjeldnenaturtypercodes: " + JSON.stringify(this.trueteogsjeldnenaturtypercodes))
  // // // }

  // // // // isTrueteogsjeldnenaturtype = (ntcode) => {
  // // // //     const r = {}
  // // // //     r.Id = [ntcode.niNCode]
  // // // //     if(ntcode.length > 1) {
  // // // //         for(var i = 1; i < ntcode.length; ++i)
  // // // //         {
  // // // //             r.Id.push(ntcode[i].niNCode)
  // // // //         }
  // // // //     }
  // // // //     // console.log("!!! r.Id: " + JSON.stringify(r.Id))
  // // // //     return this.trueteogsjeldnenaturtypercodes.some(element => r.Id.includes(element))
  // // // // }

  // // // isTrueteogsjeldnenaturtype = (ntcode) => {
  // // //     return this.trueteogsjeldnenaturtypercodes.includes(ntcode)
  // // // }

  // // // transformnaturtyperNIN2(nin2codes) {
  // // //     const r = {}
  // // //     r.Id = nin2codes.Id
  // // //     r.Value = nin2codes.Id
  // // //     r.Text = nin2codes.Text
  // // //     r.Collapsed = true
  // // //     if(nin2codes.Redlisted) {
  // // //         r.Redlisted = nin2codes.Redlisted
  // // //     }
  // // //     r.Children = []
  // // //     if(nin2codes.Children) {
  // // //         for ( var i = 0; i < nin2codes.Children.length; ++i )
  // // //         {
  // // //             r.Children.push(this.transformnaturtyperNIN2(nin2codes.Children[i]));
  // // //         }
  // // //     }
  // // //     // console.log("!!! r.Id: " + JSON.stringify(r.Id))
  // // //     return r
  // // // }

  // ################# start section unused code!! ##################

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

  // async loadPåvirkningsfaktorer() {
  //     const json = await this.getPåvirkningsfaktorer()
  //     const pvf = observable.object(json)
  //     runInAction(() => this.påvirkningsfaktorer = pvf)
  // }

  // @computed get canAddSelectedPåvirkningsfaktor() {
  //     var sp = this.selectedPåvirkningsfaktor
  //     var validsp = (sp.id === "11." || sp.id === "0.") ?  // ukjent og ingen trussel
  //         // sp.tidspunkt === "-" &&
  //         // sp.omfang === "-" &&
  //         // sp.alvorlighetsgrad === "-"
  //         true :
  //         // sp.forkortelse &&
  //         sp.beskrivelse &&
  //         sp.tidspunkt != "-" &&
  //         sp.omfang != "-" &&
  //         sp.alvorlighetsgrad != "-"
  //     return validsp
  // }

  // @action clearSelectedPåvirkningsfaktor() {
  //     transaction(() => {
  //         const sp = this.selectedPåvirkningsfaktor
  //         sp.id = null
  //         sp.forkortelse = null
  //         sp.overordnetTittel = null
  //         sp.beskrivelse = null
  //         sp.tidspunkt = null
  //         sp.omfang = null
  //         sp.alvorlighetsgrad = null
  //         sp.comment = null
  //     })
  // }

  // @action addSelectedPåvirkningsfaktor() {
  //     const påv = toJS(this.selectedPåvirkningsfaktor)
  //     const existing = this.assessment.påvirkningsfaktorer.find(item =>
  //         item.id == påv.id)
  //     if(existing) {
  //         // console.log("existing:" + JSON.stringify(existing))
  //         this.assessment.påvirkningsfaktorer.remove(existing)
  //     }
  //     this.assessment.påvirkningsfaktorer.push(påv)
  //     this.clearSelectedPåvirkningsfaktor()
  // }

  // @action removeSelectedPåvirkningsfaktor(påv) {
  //     //const påv = this.selectedPåvirkningsfaktor
  //     this.assessment.påvirkningsfaktorer.remove(påv)
  //     console.log("Removed " + påv.beskrivelse)
  // }

  // @action editPåvirkningsfaktor(påv) {
  //     console.log("Edit " + JSON.stringify(påv))

  //     transaction(() => {
  //         const sp = this.selectedPåvirkningsfaktor
  //         sp.id = påv.id
  //         sp.forkortelse = påv.forkortelse
  //         sp.overordnetTittel = påv.overordnetTittel
  //         sp.beskrivelse = påv.beskrivelse
  //         sp.tidspunkt = påv.tidspunkt
  //         sp.omfang = påv.omfang
  //         sp.alvorlighetsgrad = påv.alvorlighetsgrad
  //         sp.comment = påv.comment
  //     })
  // }
  // ################# end section unused code!! ##################

  // ################# section API stuff ##################
  getUrl = config.getUrl;

  get AssessmentReportLink() {
    if (!this.assessment) {
      return null;
    }
    const docid = this.assessmentId;
    const url = config.getUrl("artsrapport/assessmentview/") + docid;
    // console.log("URL:" + url)
    return url;
  }

  // addGetters(assessmentObject) {
  //     console.log("addGetters")
  //     console.log(JSON.stringify(Object.keys(assessmentObject)))
  // }

  async saveCurrentAssessment() {
    events.trigger("saveAssessment", "savestart");
    // const data = toJS(this.assessment)
    // const json = JSON.stringify(data)
    const json = this.assessment.toJSON;

    const currentdata = JSON.parse(json);
    const data = JSON.parse(json);
    const datastring = JSON.stringify(data);
    // this.addGetters(data)
    console.log("Y:" + json.length);
    const id = data.id;
    const url = config.getUrl("assessment/") + id;
    fetch(url, {
      method: "POST",
      // mode: 'no-cors',
      body: datastring, // data can be `string` or {object}! (cant get it to work with {object}...)
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      },
    })
      //   .then(res => res.json())
      //   .then(response => console.log('Success:', JSON.stringify(response)))
      .then((response) => checkStatus(response))
      .then(() => this.updateAssessmentSavedVersion(currentdata))
      .then(() => events.trigger("saveAssessment", "savesuccess"))
      .catch((error) => {
        events.trigger("saveAssessment", "savefailure");
        console.error("Error:", error);
      });
  }

  // @action getAssessmentsForFilter() {
  //     const påv = toJS(this.selectedPåvirkningsfaktor)
  //     const existing = this.assessment.påvirkningsfaktorer.find(item =>
  //         item.id == påv.id)
  //     if(existing) {
  //         // console.log("existing:" + JSON.stringify(existing))
  //         this.assessment.påvirkningsfaktorer.remove(existing)
  //     }
  //     this.assessment.påvirkningsfaktorer.push(påv)
  //     // this.clearSelectedPåvirkningsfaktor()
  // }

  async loadExpertgroupAssessmentList(expertgroupId) {
    runInAction(() => (this.loadingExpertGroup = true));
    const id = expertgroupId.replace("/", "_");

    var filters = "";
    if (this.assessmentTypeFilter == "horizonScanning") {
      filters = filters + "&HorizonScan=true";

      if (
        this.horizonScanFilter.potentialDoorKnockers.some(
          (x) => x == "newPotentialDoorKnocker"
        )
      )
        filters = filters + "&Horizon.NR2018=1";
      if (
        this.horizonScanFilter.potentialDoorKnockers.some((x) => x == "NR2018")
      )
        filters = filters + "&Horizon.NR2018=5";
      if (
        this.horizonScanFilter.notAssessedDoorKnocker.some(
          (x) => x == "notAssessedDoorKnocker"
        )
      )
        filters = filters + "&Horizon.NR2018=6";
      if (
        this.horizonScanFilter.notAssessedDoorKnocker.some(
          (x) => x == "notEstablishedWithin50Years"
        )
      )
        filters = filters + "&Horizon.NR2018=7";

      if (this.horizonScanFilter.hsNotStarted)
        filters = filters + "&Horizon.NotStarted=true";
      if (this.horizonScanFilter.hsFinished)
        filters = filters + "&Horizon.Finished=true";
      if (this.horizonScanFilter.toAssessment)
        filters = filters + "&Horizon.ToAssessment=true";
      if (this.horizonScanFilter.notAssessed)
        filters = filters + "&Horizon.NotAssessed=true";

      if (this.responsible.length > 0) {
        //console.log(this.responsible)
        filters =
          filters + this.responsible.map((x) => "&Responsible=" + x).join();
      }

      if (this.kunUbehandlede)
        filters = filters + "&Comments.KunUbehandlede=true";
    } else {
      filters = filters + "&HorizonScan=false";
      if (this.hSStatus) filters = filters + "&HSStatus=true";
      if (this.filterType == "FL2018") {
        if (this.historyFilter.vurdert) {
          filters = filters + "&History.Status=vurdert";
        } else {
          if (this.historyFilter.riskAssessedFilter.length > 0)
            filters =
              filters +
              this.historyFilter.riskAssessedFilter
                .map((x) => "&History.Status=" + x)
                .join();
        }

        if (this.historyFilter.ikkevurdert) {
          filters = filters + "&History.Status=ikkevurdert";
        } else {
          if (this.historyFilter.riskNotAssessedFilter.length > 0)
            filters =
              filters +
              this.historyFilter.riskNotAssessedFilter
                .map((x) => "&History.Status=" + x)
                .join();
        }

        if (this.historyFilter.riskCategoryFilter.length > 0)
          filters =
            filters +
            this.historyFilter.riskCategoryFilter
              .map((x) => "&History.Category=" + x)
              .join();
        if (this.historyFilter.decisiveCriteriaFilter.length > 0)
          filters =
            filters +
            this.historyFilter.decisiveCriteriaFilter
              .map((x) => "&History.Criteria=" + x.toUpperCase())
              .join();
      }
      if (this.filterType == "FL2023") {
        if (this.currentFilter.vurdert) {
          filters = filters + "&Current.Status=vurdert";
        } else {
          if (this.currentFilter.riskAssessedFilter.length > 0)
            filters =
              filters +
              this.currentFilter.riskAssessedFilter
                .map((x) => "&Current.Status=" + x)
                .join();
        }

        if (this.currentFilter.ikkevurdert) {
          filters = filters + "&Current.Status=ikkevurdert";
        } else {
          if (this.currentFilter.riskNotAssessedFilter.length > 0)
            filters =
              filters +
              this.currentFilter.riskNotAssessedFilter
                .map((x) => "&Current.Status=" + x)
                .join();
        }

        if (this.currentFilter.riskCategoryFilter.length > 0)
          filters =
            filters +
            this.currentFilter.riskCategoryFilter
              .map((x) => "&Current.Category=" + x)
              .join();
        if (this.currentFilter.decisiveCriteriaFilter.length > 0)
          filters =
            filters +
            this.currentFilter.decisiveCriteriaFilter
              .map((x) => "&Current.Criteria=" + x.toUpperCase())
              .join();
      }
      if (this.filterType == "statusAndCommentFL2023") {
        if (this.workStatus.length > 0) {
          filters = filters + this.workStatus.map((x) => "&Status=" + x).join();
        }

        if (this.responsible.length > 0) {
          //console.log(this.responsible)
          filters =
            filters + this.responsible.map((x) => "&Responsible=" + x).join();
        }
        if (this.otherComments.length > 0) {
          //console.log(this.responsible)
          filters = filters + "&Comments.UserId=" + auth.userId;
          filters =
            filters +
            this.otherComments.map((x) => "&Comments.CommentType=" + x).join();
        }
      }
    }
    if (this.expertgroupAssessmentFilter.length > 1) {
      filters = filters + "&NameSearch=" + this.expertgroupAssessmentFilter;
    }

    const url =
      config.getUrl("expertgroupassessments/") + id + "?page=1" + filters;
    const expertgroupAssessments = await auth.getJsonRequest(url);

    //console.log("------" + JSON.stringify(expertgroupAssessments))

    const role = expertgroupAssessments.rolle;

    // role.skriver = true
    // role.leser = true

    const assessments = observable.array(expertgroupAssessments.assessments);
    const fixCode = function (author) {
      //var parts = author.split(";");
      return {
        text: author.name + " (" + author.count + ")",
        value: author.name,
      };
    };
    const authors = expertgroupAssessments.facets[0].facetsItems.map((author) =>
      fixCode(author)
    );
    console.log("loded " + assessments.length + " assessments");
    runInAction(() => {
      this.expertgroupAssessmentList = assessments;
      this.roleincurrentgroup = role;
      this.loadingExpertGroup = false;
      this.expertgroupAssessmentTotalCount = expertgroupAssessments.totalCount;
      this.expertgroupAssessmentFilterCount =
        expertgroupAssessments.filterCount;
      this.expertgroupAssessmentAuthors = observable.array(authors);

      if (this.responsible.length > 0) {
        for (var i = 0; i < this.responsible.length; i++) {
          var isInGroup = false;
          for (var j = 0; j < this.expertgroupAssessmentAuthors.length; j++) {
            if (
              this.expertgroupAssessmentAuthors[j].value == this.responsible[i]
            ) {
              isInGroup = true;
            }
          }
          if (!isInGroup) {
            this.responsible.remove(this.responsible[i]);
          }
        }
      }
      this.assessmentsStatistics = observable(expertgroupAssessments.facets);
    });
  }

  //getAssessment = flow(function * (assessmentId) {
  async getAssessment(assessmentId) {
    const url = config.getUrl("assessment/") + assessmentId;
    //console.log("assessmentId: " + assessmentId)
    // try {
    const response = await fetch(url, {
      method: "GET",
      // mode: 'no-cors',
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      }),
    })
      .then((response) => {
        if (response.status >= 400 && response.status < 600) {
          throw new Error("Bad response from server");
        }
        return response;
      })
      .then((returnedResponse) => {
        // Your response to manipulate
        //    const json = await returnedResponse.json()
        return returnedResponse;
      })
      .catch((error) => {
        // Your error is here!
        console.log(error);
      });

    const json = await response.json();

    return json;
  }

  createNewAssessment(taxinfo) {
    console.log(
      "opprett ny vurdering: " +
        taxinfo.ScientificName +
        " " +
        taxinfo.ScientificNameId +
        " " +
        taxinfo.Ekspertgruppe
    );
    const url = config.getUrl("assessment/createnew");
    fetch(url, {
      method: "PUT",
      // mode: 'no-cors',
      body: JSON.stringify(taxinfo),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      },
    })
      .then((response) => checkStatus(response))
      .then(() => events.trigger("saveAssessment", "savesuccess"))
      .then(() => this.loadCurrentExpertgroupAssessmentList())
      .then(() => (this.viewMode = "choosespecie"))

      //   .then((responsdata) => {if (responsdata && responsdata.message) alert(responsdata.message)})
      .catch((error) => {
        events.trigger("saveAssessment", "savefailure");
        console.error("Error:", error);
      });
  }

  moveAssessmentScientificName(taxinfo) {
    const id = this.assessmentId;
    console.log(
      "flytt vurdering til nytt navn: " +
        taxinfo.ScientificName +
        " " +
        taxinfo.ScientificNameId +
        " " +
        taxinfo.Ekspertgruppe
    );
    console.log(id + " - " + JSON.stringify(taxinfo));
    const url = config.getUrl("assessment/" + id + "/move");
    fetch(url, {
      method: "POST",
      // mode: 'no-cors',
      body: JSON.stringify(taxinfo),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      },
    })
      .then((response) => checkStatus(response))
      .then(() => events.trigger("saveAssessment", "savesuccess"))
      .then(() => this.loadCurrentExpertgroupAssessmentList())
      .then(() => action(() => (this.viewMode = "choosespecie"))())
      //   .then((responsdata) => {if (responsdata && responsdata.message) alert(responsdata.message)})
      .catch((error) => {
        events.trigger("saveAssessment", "savefailure");
        console.error("Error:", error);
      });
  }

  lockFraHode(v) {
    loadData(
      config.getUrl("assessment/" + v.id + "/lock"),
      (data) => {
        // Now open the locked
        // const id = Number(v.id)

        //todo: there is something fishy going on here. The v.id must be string for this thing to work???!!
        // so something must be wrong. this.assessmentId is Number!

        runInAction(() => (this.assessmentId = v.id));
        this.loadExpertgroupAssessmentList(this.expertgroup);
      },
      (error) => alert("Feil ved låsing:" + error)
    );
  }

  unlockFraHode(v) {
    loadData(
      config.getUrl("assessment/" + v.id + "/unlock"),
      (data) => {
        this.loadExpertgroupAssessmentList(this.expertgroup);
      },
      (error) => alert("Feil ved opplåsing:" + error)
    );
  }

  async getExpertGroups() {
    const url = config.getUrl("expertgroups");
    console.log("getExpertGroups: " + url);

    const response = await fetch(url);
    const json = await response.json();
    console.log("getExpertGroups: " + JSON.stringify(json));

    return json;
  }

  async getExpertGroupAssessmentList(expertgroupId) {
    const id = expertgroupId.value.replace("/", "_");
    const url = config.getUrl("expertgroupassessments/") + id;

    const response = await fetch(url);
    const json = await response.json();
    //console.log("getExpertGroupAssessmentList: " + JSON.stringify(json))
    return json;
  }

  async finishCurrentAssessment(statusaction) {
    const id = this.assessment.id;
    const url = config.getUrl("assessment/") + id + "/" + statusaction;
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      },
    })
      .then(() => console.log("Do the finishing touches"))
      .then(() => this.finishassessment(statusaction, this.assessment))
      .then(() => events.trigger("saveAssessment", "savesuccess"))
      .then(() => this.loadCurrentExpertgroupAssessmentList())
      .catch((error) => {
        events.trigger("saveAssessment", "savefailure");
        console.error("Error:", error);
      });
  }

  copyThisAssessmentToTestarter() {
    if (!this.roleincurrentgroup.admin) {
      console.warn("copyThisAssessmentToTestarter: 'Not allowed'");
      alert("copyThisAssessmentToTestarter: 'Not allowed'");
      return;
    }
    const id = this.assessment.id;
    const url = config.getUrl("assessment/") + id + "/copytotestarter";
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.getAuthToken,
      },
    }).catch((error) => {
      console.error("Error:", error);
    });
  }
  // ################# end section API stuff ##################

  get isDirty() {
    if (!this.assessmentId || !this.assessment) return false;
    // const a = JSON.stringify(this.assessment)
    const a = this.assessment.toJSON;
    const b = this.assessmentSavedVersionString;
    return a != b;
  }

  // ######################################################################################################################################
  // ######################################################################################################################################
  // ######################################    Move this code to enhance assessment    ####################################################
  // ######################################################################################################################################
  // ######################################################################################################################################

  // // // @computed get canEdit() {
  // // //     return true
  // // //     // if (!auth.hasAccess) return false;
  // // //     // if (appState.viewMode === "choosespecie") return false;
  // // //     // return isLockedByMe() && !isFinished();
  // // // };

  // @computed get horizonDoAssessment() {
  //     if (!this.assessment) return false;
  //     const result =
  //         !this.assessment.horizonEstablismentPotential || !this.assessment.horizonEcologicalEffect ?
  //         false :
  //         this.assessment.horizonEstablismentPotential == "2"
  //         || (this.assessment.horizonEstablismentPotential == "1" && this.assessment.horizonEcologicalEffect != "no")
  //         || (this.assessment.horizonEstablismentPotential == "0" && this.assessment.horizonEcologicalEffect == "yesAfterGone")
  //     return result
  // }

  // @computed get horizonDoScanning() {
  //     return !this.harVurdering ? false : this.assessment.horizonDoScanning
  // }

  // @computed get horizonScanned() {
  //     return !this.harVurdering ? false : (this.assessment.horizonEstablismentPotential == 2
  //                                         || (this.assessment.horizonEstablismentPotential == 1 && this.assessment.horizonEcologicalEffect != "no")
  //                                         || (this.assessment.horizonEstablismentPotential == 0 && this.assessment.horizonEcologicalEffect == "yesAfterGone"))
  // }

  // @computed get skalVurderes() {
  //     // todo. denne er nå knyttet til horisontskanning. Burde kanskje vært generell og hentet verdi fra: assessment.assessmentConclusion
  //     return !this.harVurdering ? false : this.assessment.isDoorKnocker && this.assessment.skalVurderes ? true : false
  // }
  // @computed get doFullAssessment() {
  //     return !this.harVurdering ? false : this.assessment.doFullAssessment
  // }

  // ######################################################################################################################################
  // ######################################################################################################################################
  // ######################################################################################################################################

  // ######################################################################################################################################
  // ######################################################################################################################################
  // ###############  This code is for FAB assessment and is put her for for UI desitions (!?)  ###########################################
  // ######################################################################################################################################
  // ######################################################################################################################################
  moveAssessmentHorizon = (riskhorizon) => {
    const doorknockerstate = riskhorizon.potensiellDørstokkart;
    const id = this.assessmentId;
    console.log("onMoveAssessmentHorizon: " + doorknockerstate);

    console.log("Show the cat");
    action(() => (this.showTheCat = true))();
    savetimer = setTimeout(
      () => events.trigger("moveAssessment", "timeout"),
      30000
    );
    console.log("Move assessment starter -");
    this.movehorizon(id, doorknockerstate);
    action(() => {
      this.viewMode = "choosespecie";
      this.assessmentId = null;
    })();
  };

  movehorizon(id, doorknockerstate) {
    loadData(
      config.getUrl("assessment/" + id + "/movehorizon/" + doorknockerstate),
      (data) => {
        this.loadExpertgroupAssessmentList(this.expertgroup);
      },
      (error) =>
        alert(
          "Feil ved flytting mellom horisontskanning og risikovurdering:" +
            error
        )
    );
  }
  // ######################################################################################################################################
  // ######################################################################################################################################
  // ######################################################################################################################################
}

export default new ViewModel();
