import React, {Component} from 'react'
import { observer, inject } from 'mobx-react'
import {action, extendObservable} from 'mobx'
import * as Xcomp from '../observableComponents'
import Tabs from '../tabs'
import Assessment10Horisontskanning from './assessment10Horisontskanning'
import Assessment20ArtensStatus from './assessment20ArtensStatus'
import Assessment30Artsegenskaper from './assessment30Artsegenskaper'
import Assessment41Import from './assessment41Import'
import Assessment50Bakgrunnsdata from './assessment50Bakgrunnsdata'
import Assessment60Risikovurdering from './assessment60Risikovurdering'
import Assessment70Klimaeffekter from './assessment70Klimaeffekter'
import Assessment80GeografiskVariasjon from './assessment80GeografiskVariasjon'
import Assessment91Kriteriedokumentasjon from './assessment91Kriteriedokumentasjon'
import AssessmentReferences from './assessmentReferences'
import AssessmentComments from './assessmentComments'
import createTaxonSearch from '../createTaxonSearch'
import ErrorBoundary from '../errorBoundary'
import AssessmentDiff from '../assessmentDiff'

class AssessmentRoot extends Component {
    constructor(props) {
        super(props)
        extendObservable(this, {
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
        createTaxonSearch(this.newTaxon, this.props.appState.evaluationContext)
    }
    render() {
        const {appState, appState:{assessment}, appState:{assessmentTabs}} = this.props
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
        return (
            <div>
                <Tabs clName={"nav_menu faner"} tabData={assessmentTabs}/> 
                {assessmentTabs.activeTab.id === 0
                ? <ErrorBoundary><Assessment10Horisontskanning/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 1 
                ? <ErrorBoundary><Assessment20ArtensStatus newTaxon={this.newTaxon}/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 2
                ? <ErrorBoundary><Assessment30Artsegenskaper /></ErrorBoundary>
                : assessmentTabs.activeTab.id === 3
                ? <ErrorBoundary><Assessment41Import/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 4
                ? <ErrorBoundary><Assessment50Bakgrunnsdata/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 5
                ? <ErrorBoundary><Assessment60Risikovurdering/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 6
                ? <ErrorBoundary><Assessment70Klimaeffekter/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 7
                ? <ErrorBoundary><Assessment80GeografiskVariasjon/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 8
                ? <ErrorBoundary><Assessment91Kriteriedokumentasjon kritDocInfo={kritDocInfo}/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 9
                ? <ErrorBoundary><AssessmentReferences/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 10
                ? <ErrorBoundary><AssessmentComments/></ErrorBoundary>
                : assessmentTabs.activeTab.id === 11
                ? <AssessmentDiff/>
                :<h1>Oooops?? artinfotab:{assessmentTabs.activeTab.id}</h1>}
                {assessmentTabs.activeTab.id !== 12 && assessmentTabs.activeTab.id !== 11 && assessment && assessment.evaluationStatus !== 'finished'
                ? <Xcomp.Button 
                    primary 
                    disabled={assessmentTabs.activeTab.id === 7 && assessment.riskAssessment.riskLevelCode === "NK"} 
                    style={{marginTop: '10px', marginBottom: '10px'}} 
                    onClick= {() => {
                        console.log("Save assessment");
                        appState.saveCurrentAssessment();
                    }}>Lagre</Xcomp.Button>
                : null}
            </div>
        )
    }
}

export default function Assessment(props) {
    const UserContext = props.appState.UserContext
    return (
        <UserContext.Provider>
            <inject('appState')(observer(AssessmentRoot)) />
        </UserContext.Provider>
    );
}

