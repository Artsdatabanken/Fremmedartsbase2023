import React from 'react'
import config from '../../config';
import {observer, inject} from 'mobx-react'
import * as Xcomp from './observableComponents'
import Tabs from '../tabs'
import Assessment51Naturtyper from './assessment51Naturtyper'
import Assessment52Utbredelse from './assessment52Utbredelse'
@inject('appState')
@observer

export default class Assessment50Bakgrunnsdata extends React.Component {
    render() {
        const {appState:{assessment}, appState, appState:{infoTabs}} = this.props
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        //const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const labels = appState.codeLabels.DistributionHistory
        return (
            <div>
                    <Tabs clName={"nav_menu submenu"} tabData={infoTabs}/>
                    {
                        infoTabs.activeTab.id === 2  ?
                        <Assessment51Naturtyper/> :
                        <Assessment52Utbredelse/>
                        //<Utbredelseshistorikk vurdering={vurdering} fabModel={appState}/>
                    }
            </div>
        )
    }
}
