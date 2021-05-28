import config from '../../config';
import React from 'react'
import {observer, inject} from 'mobx-react'

import Vurdering40Naturtyper from './vurdering40Naturtyper'
import Tabs from '../tabs'
import Utbredelseshistorikk from './35Utbredelseshistorikk/Utbredelseshistorikk'
import UtbredelseIDag from './35Utbredelseshistorikk/UtbredelseIDag'
import UtbredelseshistorikkInnenlands from './35Utbredelseshistorikk/UtbredelseshistorikkInnenlands'


@inject('appState')
@observer
export default class Vurdering35Utbredelseshistorikk extends React.Component {
    render() {
        const {vurdering, fabModel, appState:{infoTabs}} = this.props
        return (
            <div>
                <br/>
                <Tabs clName={"nav_menu submenu"} tabData={infoTabs}/>
                {
                infoTabs.activeTab.id === 2  ?
                <Vurdering40Naturtyper/> :
                <h1>Her kommer info om utbredelse</h1>}
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
