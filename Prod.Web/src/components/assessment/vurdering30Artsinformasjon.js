import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import Tabs from '../tabs';
import Assessment20ArtensStatus from './assessment20ArtensStatus';
import Vurdering32Artsegenskaper from './assessment30Artsegenskaper';
import Vurdering33Import from './assessment41Import';
import Vurdering34Spredningsveier from './vurdering34Spredningsveier';
import Vurdering35Utbredelseshistorikk from './assessment50risikoinformasjon';
import { JsonHubProtocol } from '@microsoft/signalr';


@inject("appState")
@observer
export default class AssessmentSpesiesinformation extends React.Component {
    render() {
        console.log("Vurdering: " + JSON.stringify(Object.keys(this.props)))


        const {fabModel: {vurdering, ekspertgrupper}, fabModel, viewModel} = this.props;
        const {artsinformasjonTabs} = viewModel;
        return(
            <div>
                <Tabs tabData={artsinformasjonTabs} />
                <div className="content">
                    {artsinformasjonTabs.activeTab.id === 1  ?
                    <Assessment20ArtensStatus vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    : artsinformasjonTabs.activeTab.id === 2  ?
                    <Vurdering32Artsegenskaper vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    : artsinformasjonTabs.activeTab.id === 3  ?
                    <Vurdering33Import vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    : artsinformasjonTabs.activeTab.id === 4  ?
                    <Vurdering34Spredningsveier vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
                    : artsinformasjonTabs.activeTab.id === 5  ?
                    <Vurdering35Utbredelseshistorikk vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel}  />
                    :<h1>Oooops?? artinfotab:{artsinformasjonTabs.activeTab.id}</h1>}
                </div>
            </div>
        );
    }
}

// Vurdering.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	fabModel: PropTypes.object.isRequired
// }
