import React, {Component} from 'react'
import { observer, inject } from 'mobx-react'
import {action, observable} from 'mobx'
import auth from './authService'
import * as Xcomp from './observableComponents'
import Tabs from './tabs'
// import Vurdering from './assessment/vurdering'
import Vurdering31ArtensStatus from './assessment/vurdering31ArtensStatus'
import Vurdering32Artsegenskaper from './assessment/vurdering32Artsegenskaper'
import Vurdering33Import from './assessment/vurdering33Import'
import Vurdering34Spredningsveier from './assessment/vurdering34Spredningsveier'
import Vurdering35Utbredelseshistorikk from './assessment/vurdering35Utbredelseshistorikk'

// import AssessmentSpesiesinformation from './assessmentSpesiesinformation'
// import AssessmentNaturetypes from './assessmentNaturetypes';
// import AssessmentImpact from './assessmentImpact'
// import AssessmentA from './assessmentA'
// import AssessmentB from './assessmentB'
// import AssessmentC from './assessmentC'
// import AssessmentD from './assessmentD'
// import AssessmentE from './assessmentE'
import AssessmentDiff from './assessmentDiff'
// import AssessmentOverview from './assessmentOverview'
// import AssessmentReferences from './assessmentReferences'
// import AssessmentComments from './assessmentComments'
import AssessmentMove from './assessmentMove'
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
            // var isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.user.name
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

                <Tabs tabData={assessmentTabs}/> 
                {
                assessmentTabs.activeTab.id === 1  ?
                <Vurdering31ArtensStatus />
                : assessmentTabs.activeTab.id === 2  ?
                <Vurdering32Artsegenskaper />
                : assessmentTabs.activeTab.id === 3  ?
                <Vurdering33Import/>
                : assessmentTabs.activeTab.id === 4  ?
                <Vurdering35Utbredelseshistorikk/>
                : assessmentTabs.activeTab.id === 5  ?
                <h1> <b> Invasjonspotensiale / Økologisk effekt  </b></h1>
                // // // : assessmentTabs.activeTab.id === 6  ?
                // // // <AssessmentC/>
                // // // : assessmentTabs.activeTab.id === 7  ?
                // // // <AssessmentD/>
                // // // : assessmentTabs.activeTab.id === 8  ?
                // // // <AssessmentE/>
                // // // assessmentTabs.activeTab.id === 9  ?
                // // // <AssessmentOverview/>
                // // // : assessmentTabs.activeTab.id === 10  ?
                // // // <AssessmentReferences/>
                // // // : assessmentTabs.activeTab.id === 11  ?
                // // // <AssessmentComments/>
                : assessmentTabs.activeTab.id === 11  ?
                <AssessmentDiff/>
                :<h1>Oooops?? artinfotab:{assessmentTabs.activeTab.id}</h1>}
                {assessmentTabs.activeTab.id != 12 && assessmentTabs.activeTab.id != 11 && assessment && assessment.evaluationStatus !== 'finished' &&     
                <Xcomp.Button primary onClick= {() => {
                    console.log("Save assessment")
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
        const isreadonly = this.props.appState.asssessment.lockedForEditByUser !== user.userName
        return isreadonly || this.isFinished()
    }
}

export default function Assessment(props) {
    const UserContext = props.appState.UserContext
    return <UserContext.Provider>
        <AssessmentRoot />
    </UserContext.Provider>

}
