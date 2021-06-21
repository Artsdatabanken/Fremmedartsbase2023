import React from 'react'
import {observer, inject} from 'mobx-react'
import * as Xcomp from '../observableComponents'
@inject('appState')
@observer
export default class Utbredelseshistorikk extends React.Component {
    render() {
        const {appState:{assessment}, vurdering, fabModel} = this.props
        //const labels = fabModel.kodeLabels.DistributionHistory
        
        const labels = fabModel.codeLabels.DistributionHistory
        return (
            <div>
                <fieldset>
                    <h2>Utbredelse i Norge</h2>
                    <h3>Forekomstareal [for selvstendig reproduserende arter]</h3>
                </fieldset>
                <fieldset>
                    <h2>Utbredelse i Norge</h2>
                    <h3>Forekomstareal [for dørstokkarter]</h3>
                </fieldset>
                <fieldset>
                    <h2>Fylkesvis utbredelse</h2>
                    <p>Beskriv grunnlaget for anslagene (gjelder både forekomstareal og fylkesvis utbredelse)</p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'backgroundRegional']}/>
                    <p>Beskriv utbredelseshistorikk og dagens utbredelse i Norge <i>(overføres til oppsummeringen)</i></p>
                    <p>[For dørstokkarter:] Beskriv antatt utbredelse <i>(overføres til oppsummeringen)</i></p>
                    <Xcomp.HtmlString observableValue={[assessment.riskAssessment, 'historyAndAreaInNorway']}/>
                    <h3>Annen informasjon</h3>
                </fieldset>
                <fieldset className="well" id="spreadHistoryDomestic">
                    {/* <h4>{labels.distributionHistory} {fabModel.evaluationContext.nameWithPreposition}</h4>
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
                        observableValue={[vurdering.RiskAssessment, 'CriteriaDocumentationDomesticSpread']}/>*/}
                        
                </fieldset>
                {/* <fieldset className="well" id="spreadHistoryForeign">
                    <h4>{labels.distributionHistoryAbroad}</h4>
                   <Xcomp.HtmlString
                        observableValue={[vurdering, 'SpreadHistoryForeignDocumentation']}/> 
                </fieldset>*/}
            </div>
        )
    }
}