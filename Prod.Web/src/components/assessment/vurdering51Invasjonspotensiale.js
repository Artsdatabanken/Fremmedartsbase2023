import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import Vurdering52Okologiskeffekt from './vurdering52Okologiskeffekt'
import config from '../../config'
import {getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'

@observer
class SelectableRadio extends React.Component {
    // shouldComponentUpdate() {
    //     return true
    // }
    render() {
        const [obj, prop] = this.props.observableValue
        // console.log("Selectable" + this.props.value) console.log(" - - " +
        // obj["Selectable" + this.props.value])
        const val = this.props.value
        // const activeVal =  disabled ? "" : val
        const disabled = !obj["Selectable" + val] || this.context.readonly
        const label = this.props.label + (obj[val]
            ? "  (" + obj[val] + ")"
            : "")
        const dummy = obj[prop]
        // console.log("dummy:" + dummy) console.log(">" + prop + " (" + obj[prop] + ")
        // " + val  )
        return <div className="radio" key={val}>
            <label className={disabled
                ? "disabled"
                : ""}><input
                type="radio"
                name={"radio" + prop}
                value={val}
                checked={obj[prop] === val}
                disabled={disabled}
                onChange={(e) => obj[prop] = e.currentTarget.value}/>{label}</label>
        </div>
    }
}

// SelectableRadio.contextTypes = {
//     readonly: PropTypes.bool
// }

// return <Xcomp.Radio         label={this.props.label + (obj[val] ? "  (" +
// obj[val] + ")" : "")}         value={val}         observableValue={[obj,
// prop]}         disabled={disabled}         dummy={dummy} />

@inject("appState")
@observer
export default class Vurdering51Invasjonspotensiale extends React.Component {
    // getCriterion(riskAssessment, akse, letter) {     const result =
    // riskAssessment.Criteria.filter(c => c.Akse === akse && c.CriteriaLetter ===
    // letter)[0];     return result; }
    render() {
        const {appState:{assessment:{riskAssessment}}, appState, existenceArea35} = this.props;
        // const labels = appState.kodeLabels
        const labels = appState.codeLabels
        const koder = appState.koder.Children



        // const bassertpaValues = [
        //     {
        //         Value: "Counting",
        //         Text: "Telling"
        //     }, {
        //         Value: "Estimated",
        //         Text: "Estimert"
        //     }, {
        //         Value: "MinimumEstimate",
        //         Text: "Minimumsanslag"
        //     }
        // ];
        const crit51A = getCriterion(riskAssessment, 0, "A")
        const crit51B = getCriterion(riskAssessment, 0, "B")
        const critC = getCriterion(riskAssessment, 0, "C")

        const nbsp = "\u00a0"

        const presentValue = (f) => f === "" ? <span>᠆᠆᠆᠆᠆</span> : f

        // &#11834;
        // <h5>** Invasjonspotensiale nivå: {appState.invasjonspotensialeLevel.level + 1}
        // **</h5> <h5>** Utslagsgivende kriterier:
        // {appState.invasjonspotensialeLevel.decisiveCriteria.map(crit =>
        // crit.CriteriaLetter).sort().join()} **</h5> <h5>** usikkerhet:
        // {appState.invasjonspotensialeLevel.uncertaintyLevels.slice().join(';')}
        // **</h5>**</h5>

        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Invasjonspotensiale</h3>
                    : <br/>}
                    <ul className="submeny">
                    <li>
                        Invasjonspotensiale
                    </li>
                    <li>Økologisk effekt</li>
                </ul>
                <fieldset className="well">
                    <h4>{crit51A.heading}</h4>
                    <p>{crit51A.info}</p>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadPVAAnalysisEstimatedSpeciesLongevity"]}
                        label={labels.AcritSelect.a}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadRscriptEstimatedSpeciesLongevity"]}
                        label={labels.AcritSelect.b}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeRedListCategoryLevel"]}
                        label={labels.AcritSelect.c}/> {riskAssessment.activeSpreadPVAAnalysisEstimatedSpeciesLongevity
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.a}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadPVAAnalysis">{labels.Acrit.PVAAnalysis}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'spreadPVAAnalysis']}/>
                                            </td>
                                        </tr>
                                        {appState.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Acrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${appState
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadPVAAnalysis`}
                                                    labels={labels.DistributionHistory}
                                                    {...appState.vurdering.Datasett}/>
                                            </td>
                                        </tr>
                                        : null}
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevity']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile">{labels.Acrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile">{labels.Acrit.upper}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadRscriptEstimatedSpeciesLongevity
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.b}</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptSpeciesCount">{labels.Acrit.speciesCount}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'spreadRscriptSpeciesCount']}
                                                    integer
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptPopulationGrowth">{labels.Acrit.populationGrowth}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptPopulationGrowth']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptEnvironmantVariance">{labels.Acrit.environmantVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptEnvironmantVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptDemographicVariance">{labels.Acrit.demographicVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptDemographicVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptSustainabilityK">{labels.Acrit.sustainability}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptSustainabilityK']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadRscriptQuasiExtinctionThreshold">{labels.Acrit.extinctionThreshold}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptQuasiExtinctionThreshold']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <br/>
                                                <br/>
                                                <a href="http://www.evol.no/hanno/11/levetid.htm" target="_blank">{labels.Acrit.rScriptLongevity}</a>
                                                <br/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <br/>
                                                <label htmlFor="spreadRscriptEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadRscriptEstimatedSpeciesLongevity']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveRedListCategoryLevel
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">{labels.AcritSelect.c}</th>
                                        </tr>
                                        <tr>
                                            <th colSpan="2">
                                                <br/>
                                                <span>{labels.Acrit.overview} &nbsp;
                                                    <a href="http://data.artsdatabanken.no/Files/12371" target="_blank">{labels.Acrit.overviewHere}</a>
                                                </span>
                                                <br/>
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListDataDescription">{labels.Acrit.dataDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'redListDataDescription']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListUsedCriteria">{labels.Acrit.redlistCrit}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'redListUsedCriteria']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="redListCategory">{labels.Acrit.redlistCategory}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'redListCategory']}/>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    <div>
                        <div
                            style={{
                            marginRight: "90px",
                            display: "inline-block"
                        }}>
                            <SelectableRadio
                                label={labels.AcritSelect.a}
                                value={"spreadPVAAnalysisEstimatedSpeciesLongevity"}
                                observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                            <SelectableRadio
                                label={labels.AcritSelect.b}
                                value={"spreadRscriptEstimatedSpeciesLongevity"}
                                observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                            <SelectableRadio
                                label={labels.AcritSelect.c}
                                value={"redListCategoryLevel"}
                                observableValue={[riskAssessment, "chosenSpreadMedanLifespan"]}/>
                        </div>
                        <div
                            style={{
                            display: "inline-block"
                        }}>
                            <Criterion criterion={crit51A} mode="noheading"/>
                        </div>
                    </div>

                </fieldset>
                <fieldset className="well">
                    <h4>{crit51B.heading}</h4>
                    <p>{crit51B.info}</p>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyIncreaseObservations"]}
                        label={labels.BcritSelect.a}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyLiteratureData"]}
                        label={labels.BcritSelect.c}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "activeSpreadYearlyIncreaseCalculatedExpansionSpeed"]}
                        label={labels.BcritSelect.d}/>
                    {riskAssessment.activeSpreadYearlyIncreaseObservations
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.a}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td colSpan="2">
                                                <br/>
                                                <a href="http://www.evol.no/hanno/16/ekspan.htm" target="_blank">{labels.Bcrit.rScriptExpansion}</a>
                                                <br/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservations">{labels.Bcrit.expansion}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservations']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsLowerQuartile">{labels.Bcrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseObservationsUpperQuartile">{labels.Bcrit.higher}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseObservationsUpperQuartile']}/>
                                            </td>
                                        </tr>
                                        {appState.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Bcrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${appState
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadYearlyIncrease`}
                                                    labels={labels.DistributionHistory}
                                                    {...appState.vurdering.Datasett}/>
                                            </td>
                                        </tr>
                                        : null }
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadYearlyLiteratureData
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.c}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataExpansionSpeed">{labels.Bcrit.literatureDataExpansionSpeed}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataExpansionSpeed']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataUncertainty">{labels.Bcrit.uncertainty}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataUncertainty']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataNumberOfIntroductionSources">{labels.Bcrit.introductionSources}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataNumberOfIntroductionSources']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.expansionSpeed}</label>
                                            </td>
                                            <td>
                                                <b>{presentValue(riskAssessment.spreadYearlyLiteratureData)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyLiteratureDataAssumptions">{labels.Bcrit.literatureDataAssumptions}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
                                                    observableValue={[riskAssessment, 'spreadYearlyLiteratureDataSource']}/>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    {riskAssessment.ActiveSpreadYearlyIncreaseCalculatedExpansionSpeed
                        ? <div>
                                <table className="formtable">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">
                                                {labels.BcritSelect.d}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.existenceArea}</label>
                                            </td>
                                            <td>
                                                {existenceArea35 || existenceArea35 === 0
                                                    ? <b>{existenceArea35}</b>
                                                    : <b
                                                        style={{
                                                        color: "red"
                                                    }}>{labels.Bcrit.existenceAreaRef35}</b>
}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseEstimate">{labels.Bcrit.yearlyIncrease}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseEstimate']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="spreadYearlyIncreaseEstimateDescription">{labels.Bcrit.estimateDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
                                                    observableValue={[riskAssessment, 'spreadYearlyIncreaseEstimateDescription']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.expansionSpeed}</label>
                                            </td>
                                            <td>
                                                <b>{presentValue(riskAssessment.spreadYearlyIncreaseCalculatedExpansionSpeed)}</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                            </div>
                        : null}
                    <div>
                        <div
                            style={{
                            marginRight: "90px",
                            display: "inline-block"
                        }}>
                            <SelectableRadio
                                label={labels.BcritSelect.a}
                                value={"spreadYearlyIncreaseObservations"}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                            <SelectableRadio
                                label={labels.BcritSelect.c}
                                value={"spreadYearlyLiteratureData"}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                            <SelectableRadio
                                label={labels.BcritSelect.d}
                                value={"spreadYearlyIncreaseCalculatedExpansionSpeed"}
                                observableValue={[riskAssessment, "chosenSpreadYearlyIncrease"]}/>
                        </div>
                        <div
                            style={{
                            display: "inline-block"
                        }}>
                            <Criterion criterion={crit51B} mode="noheading"/>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="well">
                    <h4>{critC.heading} &nbsp;{labels.Ccrit.transferedFrom4}</h4>
                    <p>{critC.info}</p>
                    <Criterion criterion={critC} mode="noheading"/>
                </fieldset>
                <Vurdering52Okologiskeffekt/>
            </div>
        );
    }
}


// Vurdering51Invasjonspotensiale.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }
