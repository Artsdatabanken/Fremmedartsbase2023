import config from '../../config';
import React from 'react'
import {observer, inject} from 'mobx-react'

import Tabs from '../tabs'


import Assessment61Invasjonspotensiale from './assessment61Invasjonspotensiale';
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt';
// import Vurdering53GeografiskVariasjon from './vurdering53GeografiskVariasjon';
// import Vurdering54Klimaeffekter from './vurdering54Klimaeffekter';
// import Vurdering55Kriteriedokumentasjon from './vurdering55Kriteriedokumentasjon';



@inject('appState')
@observer
export default class Assessment60risikovurdering extends React.Component {
    render() {
        const {appState, appState:{riskAssessmentTabs}} = this.props
        // const labels = appState.codeLabels.DistributionHistory
        return (
            <div>
                <Tabs  clName={"nav_menu submenu"} tabData={riskAssessmentTabs} />
                { riskAssessmentTabs.activeTab.id === 1 ?
                <Assessment61Invasjonspotensiale />
                : riskAssessmentTabs.activeTab.id === 2 ?
                <Assessment62Okologiskeffekt />
                // : riskAssessmentTabs.activeTab.id === 3 ?
                // <Vurdering53GeografiskVariasjon  />
                // : riskAssessmentTabs.activeTab.id === 4 ?
                // <Vurdering54Klimaeffekter />
                // : riskAssessmentTabs.activeTab.id === 5 ?
                // <Vurdering55Kriteriedokumentasjon kritDocInfo={kritDocInfo} />
                : <h1>Oooops?? risktab:{riskAssessmentTabs.activeTab.id}</h1>}
            </div>
        )
    }
}


