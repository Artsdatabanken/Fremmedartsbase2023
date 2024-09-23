import React from 'react';
import {observer, inject} from 'mobx-react';
import Tabs from '../tabs'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import Assessment61Invasjonspotensiale from './assessment61Invasjonspotensiale'
import config from '../../config'

class Assessment60Risikovurdering extends React.Component {
    render() {
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;
        const labels = appState.codeLabels

        return (
            <div>
                {config.showPageHeaders
                ? <h3>Invasjonspotensiale</h3>
                : null}
                <Tabs clName={"nav_menu submenu"} tabData={riskAssessmentTabs}/>

                { riskAssessmentTabs.activeTab.id === 1 
                ? <Assessment61Invasjonspotensiale />
                : riskAssessmentTabs.activeTab.id === 2
                ? <Assessment62Okologiskeffekt />
                : <h1>Oooops?? risktab:{riskAssessmentTabs.activeTab.id}</h1>}
            </div>
        );
    }
}

export default inject("appState")(observer(Assessment60Risikovurdering));
