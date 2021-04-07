import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Risikomatrise from './risikomatrise';

@observer
export default class Vurdering55Kriteriedokumentasjon extends React.Component {
    constructor(props) {
        super(props)
        // extendObservable(this, {     CriteriaDocumentation1: null,
        // CriteriaDocumentation2: null,     CriteriaDocumentation3: null,
        // CriteriaDocumentation4: null,     CriteriaDocumentation5: null,
        // CriteriaDocumentation6: null, })

    }

    setAssessmentComplete(fabModel) {
        const r = confirm("Er du sikker på at du vil ferdigstille vurderingen?")
        if (r) {
            fabModel.setAssessmentComplete()
        }
    }

    resetAssessmentComplete(fabModel) {
        const r = confirm("Er du sikker på at du vil åpne for videre vurdering?")
        if (r) {
            fabModel.updateAssessmentStatus(null)
        }
    }
                        // <p>Artens status: {fabModel.kodeLabels.AlienSpeciesCategory[kdi.alienSpeciesCategory]}</p>


    render() {
        const {riskAssessment, viewModel, fabModel, kritDocInfo} = this.props;
        const labels = fabModel.kodeLabels.critDocumentation
        const kdi = kritDocInfo
        const hasEcology = kdi.limnic || kdi.terrestrial || kdi.marine || kdi.brackishWater
        // const ltm = fabModel.kodeLabels.limnicTerrestrialMarine
        const ltml = val => fabModel.koder.limnicTerrestrialMarine.filter(kode => kode.Value === val)[0].Text
        const _alienSpeciesCategoryLabel = fabModel.koder.AlienSpeciesCategory.filter(kode => kode.Value === kdi.alienSpeciesCategory  )
        const alienSpeciesCategoryLabel = _alienSpeciesCategoryLabel ? _alienSpeciesCategoryLabel[0] ? _alienSpeciesCategoryLabel[0].Text : "not set" : "net set"
        // console.warn(fabModel.VurderingsStatus)
        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Kriteriedokumentasjon</h3>
                    : <br/>}
                    {fabModel.skalVurderes ?
                        <div>
                            <Risikomatrise
                                labels={labels}
                                invasjonspotensiale={riskAssessment.invasjonspotensialeLevel.level}
                                ecoeffect={riskAssessment.ecoeffectLevel.level}
                                invasjonUncertaintyLevels={riskAssessment.invasjonspotensialeLevel.uncertaintyLevels}
                                ecoeffectUncertaintyLevels={riskAssessment.ecoeffectLevel.uncertaintyLevels}/>
                            <h3>{riskAssessment.RiskLevelText} <b> {riskAssessment.RiskLevelCode}</b></h3>
                            <h4>{labels.decisiveCriteria}:
                                <b> {riskAssessment.DecisiveCriteria}</b>
                            </h4>
                        </div> :
                        <div>
                            <h3><b>{labels.notEvaluated}</b></h3>
                            <p>{labels.notEvaluated2}</p>
                            <p>{labels.notEvaluated3}</p>
                            <br />
                        </div> }
                <div>
                    <div className="well">
                        <h4>{labels.speciesDescription}</h4>
                        {/* <b>Slekt: {viewModel.navnabaseGenus}</b> */}
                        <p>{labels.status}: {alienSpeciesCategoryLabel}</p>
                        {hasEcology
                            ? <p>{labels.ecology}: {
                                (kdi.limnic
                                ? (`${ltml("limnic")}  `)
                                : "") +
                                (kdi.terrestrial
                                ? (`${ltml("terrestrial")}  `)
                                : "") +
                                (kdi.marine
                                ? (`${ltml("marine")}  `)
                                : "") +
                                (kdi.brackishWater
                                ? (`${ltml("brackishWater")}  `)
                                : "")
                                }</p>
                            : <b className="missingInfo">{labels.missingEcology}</b>}
                        <br/>
                        <br/>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentationSpeciesStatus']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>
                    <div className="well">
                        <h4>{labels.distribution} {fabModel.evaluationContext.nameWithPreposition}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentationDomesticSpread']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>
                    <div className="well">
                        <h4>{labels.domesticSpread}</h4>
                        <p>{labels.see33And34}</p>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentationMigrationPathways']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>
                    {/*<div className="well">
                        <h4>Invasjonspotensial og økologisk effekt</h4>
                        <h4>Risiko: {riskAssessment.riskLevel.label}{"\u00a0\u00a0\u00a0"}{riskAssessment.riskLevel.decisiveCriteriaLabel.toLowerCase()} </h4>
                    </div>
                    <div className="well">
                        <h4>Kunnskapsgrunnlag og usikkerhet</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentation5']}
                            style={{
                                width: 800,
                                height: 150,
                                maxHeight: 150
                            }}
                        />
                    </div>*/}
                    <div className="well">
                        <h4>{labels.invationPotential}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentationInvationPotential']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>
                    <div className="well">
                        <h4>{labels.ecologicalEffect}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentationEcoEffect']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>

                    <div className="well">
                        <h4>{labels.conclusion}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CriteriaDocumentation']}
                            style={{
                            width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </div>
                </div>
                <div>
                {/* fabModel.ekspertgruppe != null && fabModel.ekspertgruppeRolle && (fabModel.ekspertgruppeRolle.userName === "helgesan" || fabModel.ekspertgruppeRolle.userName === "olgah" || fabModel.ekspertgruppeRolle.userName === "Lisbeth Gederaas") */}
                    {fabModel.language === "NB" || fabModel.language === "SV"
                    ? <Xcomp.Button href={fabModel.AssessmentReportLink}>{labels.showSummary}</Xcomp.Button>
                    : null}
                </div>
                <div>
                    {fabModel.vurdering.VurderingsStatus !== 'finnished' 
                    && fabModel.ekspertgruppe !== null 
                    && fabModel.ekspertgruppeRolle 
                    && fabModel.ekspertgruppeRolle.Leder
                    ? <div>{labels.assessmentUnderWork}<p/><Xcomp.Button onClick={() => this.setAssessmentComplete(fabModel)}>{labels.setComplete}</Xcomp.Button></div>
                    : null}
                    {fabModel.vurdering.VurderingsStatus === 'finnished' 
                    && fabModel.ekspertgruppe !== null 
                    && fabModel.ekspertgruppeRolle 
                    && fabModel.ekspertgruppeRolle.Leder
                    ? <div>{labels.assessmentComplete}<p/><Xcomp.Button onClick={() => this.resetAssessmentComplete(fabModel)}>{labels.resetComplete}</Xcomp.Button></div>
                    : null}
                </div>
{/*() => fabModel.setAssessmentComplete(fabModel.vurdering)*/}
                <div>
                    <h3>{labels.criteriaDocumentation}</h3>
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentationSpeciesStatus
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentationDomesticSpread
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentationMigrationPathways
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentationInvationPotential
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentationEcoEffect
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.CriteriaDocumentation
                    }} />
                </div>
            </div>
        );
    }
}

Vurdering55Kriteriedokumentasjon.propTypes = {
    viewModel: PropTypes.object.isRequired,
    riskAssessment: PropTypes.object.isRequired
}
