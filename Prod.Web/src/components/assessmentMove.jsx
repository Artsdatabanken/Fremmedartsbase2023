
import React from 'react';
import { inject, observer } from 'mobx-react';
import Tabs from './tabs'
import AssessmentMoveScientificName from './assessmentMoveScientificName';
import AssessmentMoveHorizon from './assessmentMoveHorizon';

class AssessmentMove extends React.Component {
    render() {
        const { appState, appState: { moveAssessmentTabs } } = this.props
        return (
            <div>
                <Tabs clName={"nav_menu submenu"} tabData={moveAssessmentTabs} />
                {moveAssessmentTabs.activeTab.id === 1 ?
                    <AssessmentMoveScientificName appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onMoveAssessmentScientificName={e => { appState.moveAssessmentScientificName(e) }} />
                    : moveAssessmentTabs.activeTab.id === 2 ?
                        <AssessmentMoveHorizon appState={appState} onMoveAssessmentHorizon={e => appState.moveAssessmentHorizon(e)} />
                        : <h1>Oooops?? movetab:{moveAssessmentTabs.activeTab.id}</h1>}
            </div>
        )
    }
}

export default inject('appState')(observer(AssessmentMove));






