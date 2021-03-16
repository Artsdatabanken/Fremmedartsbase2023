import React from 'react'
import {observer} from 'mobx-react'
import * as Xcomp from '../observableComponents'

@observer
export default class Utbredelseshistorikk extends React.Component {
    render() {
        const {vurdering, fabModel} = this.props
        const labels = fabModel.kodeLabels.DistributionHistory
        return (
            <div>
                <fieldset className="well" id="spreadHistoryDomestic">
                    <h4>{labels.distributionHistory} {fabModel.evaluationContext.nameWithPreposition}</h4>
                    {vurdering.SpreadHistoryDomesticDocumentation
                    ? <div>
                        <h4>{labels.previousInfo}. <b>{labels.mustTransfer}</b></h4>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: vurdering.SpreadHistoryDomesticDocumentation
                            }} />
                        <Xcomp.Button onClick={() => {
                            const existing = vurdering.RiskAssessment.CriteriaDocumentationDomesticSpread
                            const newstring = !existing
                                ? vurdering.SpreadHistoryDomesticDocumentation
                                : existing + vurdering.SpreadHistoryDomesticDocumentation
                            vurdering.RiskAssessment.CriteriaDocumentationDomesticSpread = newstring
                            vurdering.SpreadHistoryDomesticDocumentation = null
                        }}>{labels.transfer}</Xcomp.Button>
                        <hr />
                      </div>
                    : null }
                    <Xcomp.HtmlString
                        observableValue={[vurdering.RiskAssessment, 'CriteriaDocumentationDomesticSpread']}/>
                        
                </fieldset>
                <fieldset className="well" id="spreadHistoryForeign">
                    <h4>{labels.distributionHistoryAbroad}</h4>
                    <Xcomp.HtmlString
                        observableValue={[vurdering, 'SpreadHistoryForeignDocumentation']}/>
                </fieldset>
            </div>
        )
    }
}