import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {Button} from 'react-bootstrap'
import HistorikkTabell from './Historikktabell'
import Filliste from './Filliste'

@observer
export default class UtbredelseshistorikkInnenlands extends React.Component {
    render() {
        const {vurdering, fabModel} = this.props
        const labels = fabModel.kodeLabels.DistributionHistory
        const history = vurdering.SpreadHistory
        return (
            <div>
                <fieldset className="well" id="spreadHistories">
                    <h4>{labels.distributionHistory} {fabModel.evaluationContext.nameWithPreposition}</h4>
                    <div>{labels.domesticDescribe} {fabModel.evaluationContext.nameWithPreposition}</div>
                    <Button
                        disabled={this.context.readonly}
                        bsStyle="primary"
                        onClick={() => {
                        fabModel
                            .artskartModel
                            .addSpreadHistory(fabModel.vurdering)
                    }}>
                        {labels.domesticAddHistory}
                    </Button>
                    <HistorikkTabell historikk={history} fabModel={fabModel}/>
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

                </fieldset>
            </div>
        )
    }
}
UtbredelseshistorikkInnenlands.contextTypes = {
    readonly: PropTypes.bool
}