
import React from 'react';
import {inject, observer} from 'mobx-react';
import Tabs from './tabs'
import AssessmentMoveScientificName from './assessmentMoveScientificName';
import AssessmentMoveHorizon from './assessmentMoveHorizon';

@inject('appState')
@observer
export default class AssessmentMove extends React.Component {
    render() {
        const {appState, appState:{moveAssessmentTabs}}  = this.props
        return (
            <div>
                <Tabs  clName={"nav_menu submenu"} tabData={moveAssessmentTabs} />
                { moveAssessmentTabs.activeTab.id === 1 ?
                <AssessmentMoveScientificName appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onMoveAssessment={e => {appState.moveAssessment(e)}}/> 
                : moveAssessmentTabs.activeTab.id === 2 ?
                <AssessmentMoveHorizon appState={appState} onMoveAssessmentHorizon={appState.onMoveAssessmentHorizon}/>
                : <h1>Oooops?? movetab:{moveAssessmentTabs.activeTab.id}</h1>}
            </div>
        )
    }
}






