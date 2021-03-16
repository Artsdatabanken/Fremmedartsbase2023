import React from 'react';
import {observer} from 'mobx-react';
import {observable, autorun} from 'mobx';
import Tabs from '../tabs';
import Vurdering31ArtensStatus from './vurdering31ArtensStatus';
import Vurdering32Artsegenskaper from './vurdering32Artsegenskaper';
import Vurdering33Import from './vurdering33Import';
import Vurdering34Spredningsveier from './vurdering34Spredningsveier';
import Vurdering35Utbredelseshistorikk from './vurdering35Utbredelseshistorikk';

@observer
export default class Vurdering extends React.Component {
    render() {
        const {fabModel: {vurdering, ekspertgrupper}, fabModel, viewModel} = this.props;
        const {artsinformasjonTabs} = viewModel;
        return(
            <div>
                <Tabs tabData={artsinformasjonTabs} />
                <div className="content">
                    {artsinformasjonTabs.activeTab.id === 1  ?
                    <Vurdering31ArtensStatus vurdering={vurdering}  viewModel={viewModel} fabModel={fabModel} />
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

Vurdering.propTypes = {
	viewModel: React.PropTypes.object.isRequired,
	fabModel: React.PropTypes.object.isRequired
}
