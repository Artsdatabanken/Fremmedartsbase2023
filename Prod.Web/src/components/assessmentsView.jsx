import React from 'react';
import { observer } from 'mobx-react';
import { action, makeObservable } from "mobx";
import Tabs from './tabs'
//import {user} from "./userSession"
import AssessmentNew from './assessmentNew'
import SelectAssessment from './selectAssessment'
import AssessmentReport from './assessmentReport'
import Statistics from './statistics'

class AssessmentsView extends React.Component {
    constructor(props) {
        super(props);

        makeObservable(this, {
            onNewAssessment: action
        });
    }

    render() {
        const { appState, appState: { selectAssessmentTabs } } = this.props;
        return (
            <div>
                {appState.ekspertgruppe != null && ((appState.ekspertgruppeRolle && appState.ekspertgruppeRolle.Leder) || auth.isAdmin) ?
                    <div>
                        -                <h1><i>{assessment.vurdertVitenskapeligNavn}</i></h1>
                        <Tabs tabData={selectAssessmentTabs} />
                        {selectAssessmentTabs.activeTab.id === 1
                            ? <SelectAssessment {...this.props} />
                            : selectAssessmentTabs.activeTab.id === 2
                                ? <AssessmentNew appState={appState} onNewAssessment={e => { selectAssessmentTabs.activeTab.id = 1 }} />
                                : selectAssessmentTabs.activeTab.id === 3
                                    ? <Statistics {...this.props} />
                                    : <AssessmentReport {...this.props} />
                        }
                    </div> :
                    <SelectAssessment {...this.props} />
                }
            </div>
        )
    }
}

export default observer(AssessmentsView);

