import React, {Component} from 'react'
import { observer, inject } from 'mobx-react'
import {action, observable} from 'mobx'
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
import VurderingComments from './vurderingComments'
import Assessment91Kriteriedokumentasjon from './assessment91Kriteriedokumentasjon'




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
import AssessmentMove from '../assessmentMove'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
// import {Fylkesforekomst} from './fylkesforekomst'
// import config from '../config'


@inject('appState')
@observer
class AssessmentRoot extends Component {
    
    lockAssessment(e, assessment, appState) {
            e.stopPropagation()
            appState.lockFraHode(assessment)
    }
    @observable move = false
    
    render() {
        const {appState, appState:{assessment}, appState:{assessmentTabs}} = this.props
        const rolle = appState.roleincurrentgroup
        const isSuperUser = rolle.leder
        const isFinished = assessment.evaluationStatus && assessment.evaluationStatus === "finished"
        const canEdit = !isFinished && appState.roleincurrentgroup.skriver && assessment.lockedForEditByUser == null    
        
        function sjekkForEndringerOgGiAdvarsel(){
            // var isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.userName
            var isdirty = appState.isDirty
            var skriver = !!appState.roleincurrentgroup && appState.roleincurrentgroup.skriver
            var ok = true;
            // if (isLockedByMe && isdirty && skriver) {
            if (isdirty && skriver) {
                ok = window.confirm("Det er endringer på vurderingen - ønsker du virkelig å gå bort fra den uten å lagre?")
            }
            if (ok) {
                appState.viewMode = "choosespecie"
                appState.updateCurrentAssessment(null)
            }
    }
                
        // console.log(rolle)
        // console.log(rolle.skriver)
        // console.log(assessment)
        // console.log(assessment.lockedForEditByUser)
        if (window.appInsights) {
            window.appInsights.trackPageView({
            name: 'Assessment ' + assessment.vurdertVitenskapeligNavn, 
            properties: { SpeciesGroup: assessment.ekspertgruppe }});
        }

        const kritDocInfo = {
            alienSpeciesCategory: assessment.alienSpeciesCategory || "AlienSpecie",
            limnic: assessment.limnic,
            terrestrial: assessment.terrestrial,
            marine: assessment.marine,
            brackishWater: assessment.brackishWater
        }


        window.scrollTo(0,0)
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
                   {this.move  &&  <div className="form_category">
                        <AssessmentMove appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onMoveAssessment={e => {appState.moveAssessment(e)}}/>            
                    </div> }
                 {/*assessmentTabs.activeTab.id != 12 &&
                 <div style={{paddingBottom: '20px'}}>
                 <Xcomp.Button primary onClick= {() => {
                    console.log("Save assessment")
                    appState.saveCurrentAssessment();
                  }}>Lagre</Xcomp.Button></div>*/}

                <Tabs clName={"nav_menu faner"} tabData={assessmentTabs}/> 
                {
                assessmentTabs.activeTab.id === 0  ?
                <Assessment10Horisontskanning/> :
                assessmentTabs.activeTab.id === 1  ?
                <Assessment20ArtensStatus />
                : assessmentTabs.activeTab.id === 2  ?
                <Assessment30Artsegenskaper />
                : assessmentTabs.activeTab.id === 3  ?
                <Assessment41Import/>
                : assessmentTabs.activeTab.id === 4  ?
                <AssessmentBakgrunnsdata/>
                : assessmentTabs.activeTab.id === 5  ?
                <AssessmentRisikovurdering/>
                : assessmentTabs.activeTab.id === 6  ?
                <Assessment70Klimaeffekter/>
                : assessmentTabs.activeTab.id === 7  ?
                <Assessment80GeografiskVariasjon/>
                : assessmentTabs.activeTab.id === 8  ?
                <Assessment91Kriteriedokumentasjon kritDocInfo={kritDocInfo}/>
                : assessmentTabs.activeTab.id === 9  ?
                <AssessmentReferences/>
                : assessmentTabs.activeTab.id === 10  ?
                <VurderingComments/>
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
                <Xcomp.Button primary style={{marginTop: '10px', marginBottom: '10px'}} onClick= {() => {
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
        const isreadonly = this.props.appState.asssessment.lockedForEditByUser !== auth.userName
        return isreadonly || this.isFinished()
    }
}

export default function Assessment(props) {
    const UserContext = props.appState.UserContext
    return <UserContext.Provider>
        <AssessmentRoot />
    </UserContext.Provider>

}

