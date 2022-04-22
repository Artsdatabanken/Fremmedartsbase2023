import React, {Component} from 'react'
import { observer, inject } from 'mobx-react'
import {action, observable, extendObservable} from 'mobx'
import auth from '../authService'
import * as Xcomp from '../observableComponents'
import Tabs from '../tabs'
// import Vurdering from './assessment/vurdering'
import Assessment20ArtensStatus from './assessment20ArtensStatus'
import Assessment30Artsegenskaper from './assessment30Artsegenskaper'
import Assessment41Import from './assessment41Import'
import Assessment10Horisontskanning from './assessment10Horisontskanning'
import Assessment40Spredningsveier from './assessment40Spredningsveier'
import Assessment52Utbredelse from './assessment52Utbredelse'
import Assessment51Naturtyper from './assessment51Naturtyper'
import AssessmentRisikovurdering from './assessmentRisikovurdering'
import AssessmentBakgrunnsdata from './assessmentBakgrunnsdata'
import Assessment61Invasjonspotensiale from './assessment61Invasjonspotensiale'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import Assessment80GeografiskVariasjon from './assessment80GeografiskVariasjon'
import Assessment70Klimaeffekter from './assessment70Klimaeffekter'
//import VurderingSummary from './vurderingSummary'
import AssessmentReferences from './assessmentReferences'
import AssessmentComments from './assessmentComments'
import Assessment91Kriteriedokumentasjon from './assessment91Kriteriedokumentasjon'
import createTaxonSearch from '../createTaxonSearch'
import ErrorBoundary from '../errorBoundary'




// import AssessmentSpesiesinformation from './assessmentSpesiesinformation'
// import AssessmentNaturetypes from './assessmentNaturetypes';
// import AssessmentImpact from './assessmentImpact'
// import AssessmentA from './assessmentA'
// import AssessmentB from './assessmentB'
// import AssessmentC from './assessmentC'
// import AssessmentD from './assessmentD'
// import AssessmentE from './assessmentE'
import AssessmentDiff from '../assessmentDiff'
// import AssessmentOverview from './assessmentOverview'
// import AssessmentComments from './assessmentComments'
// import AssessmentMove from '../assessmentMove'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
// import {Fylkesforekomst} from './fylkesforekomst'
// import config from '../config'


@inject('appState')
@observer
class AssessmentRoot extends Component {
    constructor(props) {
        super(props)
        extendObservable(this, {
            // showModal: false,
            newTaxon: {
                id: "newConnectedTaxon",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                effect : "Weak",
                scale: "Limited",
                //status: "NewAlien",
                //interactionType : "CompetitionSpace", 
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }
        })

        this.addTaxon = action(() => {
            //const taxon = assessment.connectedTaxon;            
            const newItem = this.newTaxon;
            const clone = toJS(newItem);
            // console.log("Clone: " + JSON.stringify(clone))
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            newItem.scientificName = ""
            newItem.scientificNameId = ""
            newItem.scientificNameAuthor = ""
            newItem.vernacularName = ""
            newItem.taxonRank = ""
            newItem.taxonId = ""
            newItem.redListCategory = "" 
            newItem.keyStoneSpecie = false
            newItem.interactionType = "CompetitionSpace" 
            //newItem.interactionType = []
            newItem.effect = "Weak" 
            newItem.scale = "Limited" 
            newItem.effectLocalScale = false 
            newItem.longDistanceEffect = false 
            newItem.confirmedOrAssumed = false
            newItem.domesticOrAbroad = ""
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.basisOfAssessment = []
            newItem.interactionTypes = []
            newItem.taxonSearchWaitingForResult = false
        })

        //createTaxonSearch(this.newTaxon, this.props.appState.evaluationContext, tax => tax.existsInCountry)
        createTaxonSearch(this.newTaxon, this.props.appState.evaluationContext)

    }

    

        lockAssessment(e, assessment, appState) {
                e.stopPropagation()
                appState.lockFraHode(assessment)
        }
        @observable move = false
        
        render() {
            const {appState, appState:{assessment}, appState:{assessmentTabs}} = this.props
            const rolle = appState.roleincurrentgroup
            const isSuperUser = rolle.admin
            const isFinished = assessment.evaluationStatus && assessment.evaluationStatus === "finished"
            const canEdit = !isFinished && appState.roleincurrentgroup.skriver && assessment.lockedForEditByUser == null    
            
            // function sjekkForEndringerOgGiAdvarsel(){
            //     // var isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.userId
            //     var isdirty = appState.isDirty
            //     var skriver = !!appState.roleincurrentgroup && appState.roleincurrentgroup.skriver
            //     var ok = true;
            //     // if (isLockedByMe && isdirty && skriver) {
            //     if (isdirty && skriver) {
            //         ok = window.confirm("Det er endringer på vurderingen - ønsker du virkelig å gå bort fra den uten å lagre?")
            //     }
            //     if (ok) {
            //         appState.viewMode = "choosespecie"
            //         appState.updateCurrentAssessment(null)
            //     }
            // }
                
        // console.log(rolle)
        // console.log(rolle.skriver)
        // console.log(assessment)
        // console.log(assessment.lockedForEditByUser)
        if (window.appInsights) {
            window.appInsights.trackPageView({
            name: 'Assessment ' + assessment.evaluatedScientificName, 
            properties: { SpeciesGroup: assessment.expertGroup }});
        }

        const kritDocInfo = {
            alienSpeciesCategory: assessment.alienSpeciesCategory || "AlienSpecie",
            limnic: assessment.limnic,
            terrestrial: assessment.terrestrial,
            marine: assessment.marine,
            brackishWater: assessment.brackishWater
        }


        //window.scrollTo(0,0)
        return (
            <div>
                {/*{assessment.popularName ? 
                    <h1>{assessment.vurdertVitenskapeligNavn + ", " + assessment.popularName}&nbsp;{canEdit && 
                        <Xcomp.Button alwaysEnabled='true' onClick={(e) => this.lockAssessment(e, assessment, appState)}>Start vurdering</Xcomp.Button>
                        }{auth.isAdmin && <button className="btn" title="Flytt vurderingen" aria-label="Flytt vurderingen" onClick= {action(() => {this.move === false ? this.move = true : this.move =false})}><ArrowForwardIcon /></button>}
                
                    </h1> : 
                    <h1>{assessment.vurdertVitenskapeligNavn}&nbsp;{canEdit && 
                        <Xcomp.Button alwaysEnabled='true'  onClick={(e) => this.lockAssessment(e, assessment, appState)}>Start vurdering</Xcomp.Button>
                        }{auth.isAdmin && <button className="btn" title="Flytt vurderingen" aria-label="Flytt vurderingen" onClick= {action(() => {this.move === false ? this.move = true : this.move =false})}><ArrowForwardIcon /></button>}
                
                    </h1>
                }*/}
                {/* auth.isAdmin  */}
                   {/* {this.move  &&  <div className="form_category">
                        <AssessmentMove appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onMoveAssessment={e => {appState.moveAssessment(e)}}/>            
                    </div> } */}
                 {/*assessmentTabs.activeTab.id != 12 &&
                 <div style={{paddingBottom: '20px'}}>
                 <Xcomp.Button primary onClick= {() => {
                    console.log("Save assessment")
                    appState.saveCurrentAssessment();
                  }}>Lagre</Xcomp.Button></div>*/}

                <Tabs clName={"nav_menu faner"} tabData={assessmentTabs}/> 
                {
                assessmentTabs.activeTab.id === 0  ?
                <ErrorBoundary><Assessment10Horisontskanning/></ErrorBoundary> :
                assessmentTabs.activeTab.id === 1  ?
                <ErrorBoundary><Assessment20ArtensStatus newTaxon={this.newTaxon}/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 2  ?
                <ErrorBoundary><Assessment30Artsegenskaper /></ErrorBoundary>
                : assessmentTabs.activeTab.id === 3  ?
                <ErrorBoundary><Assessment41Import/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 4  ?
                <ErrorBoundary><AssessmentBakgrunnsdata/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 5  ?
                <ErrorBoundary><AssessmentRisikovurdering/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 6  ?
                <ErrorBoundary><Assessment70Klimaeffekter/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 7  ?
                <ErrorBoundary><Assessment80GeografiskVariasjon/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 8  ?
                <ErrorBoundary><Assessment91Kriteriedokumentasjon kritDocInfo={kritDocInfo}/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 9  ?
                <ErrorBoundary><AssessmentReferences/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 10  ?
                <ErrorBoundary><AssessmentComments/></ErrorBoundary>
               // : assessmentTabs.activeTab.id === 11  ?
               // <Vurdering55Kriteriedokumentasjon kritDocInfo={kritDocInfo}/>
                // // kritDocInfo={{}}

                
                // // // : assessmentTabs.activeTab.id === 10  ?
                // // // <AssessmentReferences/>
                // // // : assessmentTabs.activeTab.id === 10  ?
                // // // <AssessmentReferences/>
                // // // : assessmentTabs.activeTab.id === 10  ?
                // // // <AssessmentReferences/>
                // // // : assessmentTabs.activeTab.id === 11  ?
                // // // <AssessmentComments/>
                : assessmentTabs.activeTab.id === 11  ?
                <AssessmentDiff/>
                :<h1>Oooops?? artinfotab:{assessmentTabs.activeTab.id}</h1>}
                {assessmentTabs.activeTab.id != 12 && assessmentTabs.activeTab.id != 11 && assessment && assessment.evaluationStatus !== 'finished' &&     
                <Xcomp.Button primary disabled={assessmentTabs.activeTab.id === 7 && assessment.riskAssessment.riskLevelCode == "NK"} style={{marginTop: '10px', marginBottom: '10px'}} onClick= {() => {
                    console.log("Save assessment");
                    appState.saveCurrentAssessment();
                  }}>Lagre</Xcomp.Button>}
            </div>
        )
    }

    isFinished() {
        const isfinished = this.props.appState.asssessment.evaluationStatus === "finished"
        return isfinished
    }

    isReadOnly() {
        const isreadonly = this.props.appState.asssessment.lockedForEditByUser !== auth.userId
        return isreadonly || this.isFinished()
    }
}

export default function Assessment(props) {
    const UserContext = props.appState.UserContext
    return <UserContext.Provider>
        <AssessmentRoot />
    </UserContext.Provider>

}

