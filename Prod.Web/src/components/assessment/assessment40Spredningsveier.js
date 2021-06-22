import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import Tabs from '../tabs';
// import assessment20ArtensStatus from './assessment20ArtensStatus';
// import Vurdering32Artsegenskaper from './assessment30Artsegenskaper';
import Assessment41Import from './assessment41Import';
// import Vurdering34Spredningsveier from './vurdering34Spredningsveier';
// import Vurdering35Utbredelseshistorikk from './vurdering35Utbredelseshistorikk';
// import { JsonHubProtocol } from '@microsoft/signalr';


@inject("appState")
@observer
export default class Assessment40Spredningsveier extends React.Component {
    render() {
        console.log("Vurdering: " + JSON.stringify(Object.keys(this.props)))


        // const {fabModel: {vurdering, ekspertgrupper}, fabModel, viewModel} = this.props;
        // const {artsinformasjonTabs} = viewModel;

        const {appState, appState:{assessment}, appState:{spredningsveierTabs}} = this.props
        const rolle = appState.roleincurrentgroup
        const isSuperUser = rolle.leder
        const isFinished = assessment.evaluationStatus && assessment.evaluationStatus === "finished"
        const canEdit = !isFinished && appState.roleincurrentgroup.skriver && assessment.lockedForEditByUser == null    


        return(
            <div> 
                <Tabs  clName={"nav_menu submenu"} tabData={spredningsveierTabs} />
                <div className="content">
                    {
                    // artsinformasjonTabs.activeTab.id === 1  ?
                    // <assessment20ArtensStatus vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    // : artsinformasjonTabs.activeTab.id === 2  ?
                    // <Vurdering32Artsegenskaper vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    // : 
                    spredningsveierTabs.activeTab.id === 1  ?
                    <Assessment41Import  />
                    // : artsinformasjonTabs.activeTab.id === 4  ?
                    // <Vurdering34Spredningsveier vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    // : artsinformasjonTabs.activeTab.id === 5  ?
                    // <Vurdering35Utbredelseshistorikk vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel}  />
                    :<h1>Oooops?? artinfotab:{spredningsveierTabs.activeTab.id}</h1>}
                </div>
            </div>
        );
    }
}

// Vurdering.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	fabModel: PropTypes.object.isRequired
// }
