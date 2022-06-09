import React from 'react'
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react'
import {Button} from 'react-bootstrap'
import HistorikkTabell from './Historikktabell'
import Filliste from './Filliste'

@inject("appState")
@observer
export default class UtbredelseshistorikkInnenlands extends React.Component {
    render() {
        const {vurdering, appState} = this.props
        
        const labels = appState.codeLabels.DistributionHistory
        const history = vurdering.spreadHistory
        return (
            <div>
                <div id="spreadHistories">
                    <h5>{labels.distributionHistory} {appState.evaluationContext.nameWithPreposition}</h5>
                    <HistorikkTabell disabled historikk={history} appState={appState}/>
                    {appState.fileUploadEnabled
                    ? <div>
                        <h4>{labels.domesticDataset}</h4>
                        <Filliste
                            baseDirectory={`${appState
                            .vurderingId
                            .split('/').join('_')}/SpreadHistory`}
                            {...vurdering.Datasett}
                            labels={labels}/>
                    </div>
                    : null}

                </div>
            </div>
        )
    }
}
UtbredelseshistorikkInnenlands.contextTypes = {
    readonly: PropTypes.bool
}