import config from '../../config';
import React from 'react'
import {observer, inject} from 'mobx-react'

import Assessment51Naturtyper from './assessment51Naturtyper'
import Tabs from '../tabs'
import Assessment52Utbredelse from './assessment52Utbredelse'
// import UtbredelseIDag from './35Utbredelseshistorikk/UtbredelseIDag'
// import UtbredelseshistorikkInnenlands from './35Utbredelseshistorikk/UtbredelseshistorikkInnenlands'


@inject('appState')
@observer
export default class Assessment50risikoinformasjon extends React.Component {
    render() {
        const {appState:{assessment:{riskAssessment}}, appState, vurdering, fabModel, appState:{infoTabs}} = this.props
        return (
            <div>
                <br/>
                <Tabs clName={"nav_menu submenu"} tabData={infoTabs}/>
                {
                infoTabs.activeTab.id === 2  ?
                <Assessment51Naturtyper/> :
                <Assessment52Utbredelse vurdering={vurdering} fabModel={appState}/>
                }
                {config.showPageHeaders
                    ? <h3>{fabModel.kodeLabels.DistributionHistory.heading}</h3>
                    : <br/>}
                {/*<UtbredelseshistorikkInnenlands vurdering={vurdering} fabModel={fabModel}/>
                <UtbredelseIDag vurdering={vurdering} fabModel={fabModel}/>
                <Utbredelseshistorikk vurdering={vurdering} fabModel={fabModel}/>*/}
            </div>
        )
    }
}
