import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import config from '../../config'
import {getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'

@observer
class SelectableRadio extends React.Component {
    shouldComponentUpdate() {
        return true
    }
    render() {
        const [obj,
            prop] = this.props.observableValue
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

SelectableRadio.contextTypes = {
    readonly: React.PropTypes.bool
}

// return <Xcomp.Radio         label={this.props.label + (obj[val] ? "  (" +
// obj[val] + ")" : "")}         value={val}         observableValue={[obj,
// prop]}         disabled={disabled}         dummy={dummy} />

@observer
export default class Vurdering51Invasjonspotensiale extends React.Component {
    // getCriterion(riskAssessment, akse, letter) {     const result =
    // riskAssessment.Criteria.filter(c => c.Akse === akse && c.CriteriaLetter ===
    // letter)[0];     return result; }
    render() {
        const {riskAssessment, viewModel, fabModel, existenceArea35} = this.props;
        const labels = fabModel.kodeLabels

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
        // <h5>** Invasjonspotensiale nivå: {fabModel.invasjonspotensialeLevel.level + 1}
        // **</h5> <h5>** Utslagsgivende kriterier:
        // {fabModel.invasjonspotensialeLevel.decisiveCriteria.map(crit =>
        // crit.CriteriaLetter).sort().join()} **</h5> <h5>** usikkerhet:
        // {fabModel.invasjonspotensialeLevel.uncertaintyLevels.slice().join(';')}
        // **</h5>**</h5>

        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Invasjonspotensiale</h3>
                    : <br/>}
                <fieldset className="well">
                    <h4>{crit51A.heading}</h4>
                    <p>{crit51A.info}</p>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "ActiveSpreadPVAAnalysisEstimatedSpeciesLongevity"]}
                        label={labels.AcritSelect.a}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "ActiveSpreadRscriptEstimatedSpeciesLongevity"]}
                        label={labels.AcritSelect.b}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "ActiveRedListCategoryLevel"]}
                        label={labels.AcritSelect.c}/> {riskAssessment.ActiveSpreadPVAAnalysisEstimatedSpeciesLongevity
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
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'SpreadPVAAnalysis']}/>
                                            </td>
                                        </tr>
                                        {fabModel.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Acrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${fabModel
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadPVAAnalysis`}
                                                    labels={labels.DistributionHistory}
                                                    {...fabModel.vurdering.Datasett}/>
                                            </td>
                                        </tr>
                                        : null}
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadPVAAnalysisEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadPVAAnalysisEstimatedSpeciesLongevity']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile">{labels.Acrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'SpreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile">{labels.Acrit.upper}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'SpreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile']}/>
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
                                                <label htmlFor="SpreadRscriptSpeciesCount">{labels.Acrit.speciesCount}</label>
                                            </td>
                                            <td>
                                                <Xcomp.Number
                                                    observableValue={[riskAssessment, 'SpreadRscriptSpeciesCount']}
                                                    integer
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadRscriptPopulationGrowth">{labels.Acrit.populationGrowth}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptPopulationGrowth']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadRscriptEnvironmantVariance">{labels.Acrit.environmantVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptEnvironmantVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadRscriptDemographicVariance">{labels.Acrit.demographicVariance}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptDemographicVariance']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadRscriptSustainabilityK">{labels.Acrit.sustainability}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptSustainabilityK']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadRscriptQuasiExtinctionThreshold">{labels.Acrit.extinctionThreshold}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptQuasiExtinctionThreshold']}/>
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
                                                <label htmlFor="SpreadRscriptEstimatedSpeciesLongevity">{labels.Acrit.median}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadRscriptEstimatedSpeciesLongevity']}/>
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
                                                <label htmlFor="RedListDataDescription">{labels.Acrit.dataDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString observableValue={[riskAssessment, 'RedListDataDescription']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="RedListUsedCriteria">{labels.Acrit.redlistCrit}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'RedListUsedCriteria']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="RedListCategory">{labels.Acrit.redlistCategory}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String observableValue={[riskAssessment, 'RedListCategory']}/>
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
                                value={"SpreadPVAAnalysisEstimatedSpeciesLongevity"}
                                observableValue={[riskAssessment, "ChosenSpreadMedanLifespan"]}/>
                            <SelectableRadio
                                label={labels.AcritSelect.b}
                                value={"SpreadRscriptEstimatedSpeciesLongevity"}
                                observableValue={[riskAssessment, "ChosenSpreadMedanLifespan"]}/>
                            <SelectableRadio
                                label={labels.AcritSelect.c}
                                value={"RedListCategoryLevel"}
                                observableValue={[riskAssessment, "ChosenSpreadMedanLifespan"]}/>
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
                        observableValue={[riskAssessment, "ActiveSpreadYearlyIncreaseObservations"]}
                        label={labels.BcritSelect.a}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "ActiveSpreadYearlyLiteratureData"]}
                        label={labels.BcritSelect.c}/>
                    <Xcomp.Bool
                        observableValue={[riskAssessment, "ActiveSpreadYearlyIncreaseCalculatedExpansionSpeed"]}
                        label={labels.BcritSelect.d}/>
                    {riskAssessment.ActiveSpreadYearlyIncreaseObservations
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
                                                <label htmlFor="SpreadYearlyIncreaseObservations">{labels.Bcrit.expansion}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyIncreaseObservations']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyIncreaseObservationsLowerQuartile">{labels.Bcrit.lower}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyIncreaseObservationsLowerQuartile']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyIncreaseObservationsUpperQuartile">{labels.Bcrit.higher}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyIncreaseObservationsUpperQuartile']}/>
                                            </td>
                                        </tr>
                                        {fabModel.fileUploadEnabled
                                        ? <tr>
                                            <td>
                                                {nbsp}
                                            </td>
                                            <td>
                                                <h4>{labels.Bcrit.data}</h4>
                                                <Filliste
                                                    baseDirectory={`${fabModel
                                                    .vurderingId
                                                    .split('/').join('_')}/SpreadYearlyIncrease`}
                                                    labels={labels.DistributionHistory}
                                                    {...fabModel.vurdering.Datasett}/>
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
                                                <label htmlFor="SpreadYearlyLiteratureDataExpansionSpeed">{labels.Bcrit.literatureDataExpansionSpeed}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyLiteratureDataExpansionSpeed']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyLiteratureDataUncertainty">{labels.Bcrit.uncertainty}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyLiteratureDataUncertainty']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyLiteratureDataNumberOfIntroductionSources">{labels.Bcrit.introductionSources}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyLiteratureDataNumberOfIntroductionSources']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.expansionSpeed}</label>
                                            </td>
                                            <td>
                                                <b>{presentValue(riskAssessment.SpreadYearlyLiteratureData)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyLiteratureDataAssumptions">{labels.Bcrit.literatureDataAssumptions}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
                                                    observableValue={[riskAssessment, 'SpreadYearlyLiteratureDataSource']}/>
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
                                                <label htmlFor="SpreadYearlyIncreaseEstimate">{labels.Bcrit.yearlyIncrease}</label>
                                            </td>
                                            <td>
                                                <Xcomp.String
                                                    observableValue={[riskAssessment, 'SpreadYearlyIncreaseEstimate']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label htmlFor="SpreadYearlyIncreaseEstimateDescription">{labels.Bcrit.estimateDescription}</label>
                                            </td>
                                            <td>
                                                <Xcomp.HtmlString
                                                    observableValue={[riskAssessment, 'SpreadYearlyIncreaseEstimateDescription']}/>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>{labels.Bcrit.expansionSpeed}</label>
                                            </td>
                                            <td>
                                                <b>{presentValue(riskAssessment.SpreadYearlyIncreaseCalculatedExpansionSpeed)}</b>
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
                                value={"SpreadYearlyIncreaseObservations"}
                                observableValue={[riskAssessment, "ChosenSpreadYearlyIncrease"]}/>
                            <SelectableRadio
                                label={labels.BcritSelect.c}
                                value={"SpreadYearlyLiteratureData"}
                                observableValue={[riskAssessment, "ChosenSpreadYearlyIncrease"]}/>
                            <SelectableRadio
                                label={labels.BcritSelect.d}
                                value={"SpreadYearlyIncreaseCalculatedExpansionSpeed"}
                                observableValue={[riskAssessment, "ChosenSpreadYearlyIncrease"]}/>
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
            </div>
        );
    }
}


Vurdering51Invasjonspotensiale.propTypes = {
    viewModel: React.PropTypes.object.isRequired,
    riskAssessment: React.PropTypes.object.isRequired
}
