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
        const {vurdering, fabModel} = this.props
        
        const labels = fabModel.codeLabels.DistributionHistory
        const history = vurdering.spreadHistory
        return (
            <div>
                <div id="spreadHistories">
                    <h5>{labels.distributionHistory} {fabModel.evaluationContext.nameWithPreposition}</h5>
                    {/*<div>{labels.domesticDescribe} {fabModel.evaluationContext.nameWithPreposition}</div>
                    <Button
                        disabled={this.context.readonly}
                        //bsStyle="primary"
                        className="primary"
                        onClick={() => {
                        fabModel
                            .artskartModel
                            .addSpreadHistory(fabModel.vurdering)
                    }}>
                        {labels.domesticAddHistory}
                </Button> */}
                    <HistorikkTabell disabled historikk={history} fabModel={fabModel}/>
                    {fabModel.fileUploadEnabled
                    ? <div>
                        <h4>{labels.domesticDataset}</h4>
                        <Filliste
                            baseDirectory={`${fabModel
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