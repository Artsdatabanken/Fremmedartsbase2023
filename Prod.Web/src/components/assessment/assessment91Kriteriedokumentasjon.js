import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Risikomatrise from './risikomatrise';
import Documents from '../documents'

@inject("appState")
@observer
export default class Assessment91Kriteriedokumentasjon extends React.Component {
    constructor(props) {
        super(props)
        // extendObservable(this, {     CriteriaDocumentation1: null,
        // CriteriaDocumentation2: null,     CriteriaDocumentation3: null,
        // CriteriaDocumentation4: null,     CriteriaDocumentation5: null,
        // CriteriaDocumentation6: null, })

    }

    setAssessmentComplete(appState) {
        const r = confirm("Er du sikker på at du vil ferdigstille vurderingen?")
        if (r) {
            appState.setAssessmentComplete()
        }
    }

    resetAssessmentComplete(appState) {
        const r = confirm("Er du sikker på at du vil åpne for videre vurdering?")
        if (r) {
            appState.updateAssessmentStatus(null)
        }
    }
                        // <p>Artens status: {appState.kodeLabels.AlienSpeciesCategory[kdi.alienSpeciesCategory]}</p>


    render() {
        const {appState:{assessment}, appState:{assessment:{riskAssessment}}, appState, kritDocInfo} = this.props;
        const labels = appState.codeLabels
		const koder = appState.koder
        const critlabels = labels.critDocumentation

        // const {riskAssessment, viewModel, appState, kritDocInfo} = this.props;
        // const labels = appState.kodeLabels.critDocumentation
        const kdi = kritDocInfo
        const hasEcology = kdi.limnic || kdi.terrestrial || kdi.marine || kdi.brackishWater
        // const ltm = appState.kodeLabels.limnicTerrestrialMarine
        const ltml = val => koder.limnicTerrestrialMarine.filter(kode => kode.Value === val)[0].Text
        const _alienSpeciesCategoryLabel = koder.AlienSpeciesCategory.filter(kode => kode.Value === kdi.alienSpeciesCategory  )
        const alienSpeciesCategoryLabel = _alienSpeciesCategoryLabel ? _alienSpeciesCategoryLabel[0] ? _alienSpeciesCategoryLabel[0].Text : "not set" : "net set"

        const changeLabel = (id) => koder.reasonsForCategoryChange.find(code => code.value === id).text
       
        const category2018 = (riskLevelCode) => labels.RiskLevelCode[riskLevelCode]

        // console.warn(appState.vurderingsStatus)
        return (
            <div>
                {config.showPageHeaders
                    ? <h3>{critlabels.status}</h3>
                    : <br/>}
                    <div>
                    
                    {/*<h3>{labels.critDocumentation.status}</h3>*/}
                   
                    {appState.skalVurderes ?
                        <fieldset className="well">
                            <h2>{critlabels.heading}</h2>
                            <p>{critlabels.status}: {alienSpeciesCategoryLabel}</p>
                            <Risikomatrise
                                labels={critlabels}
                                invasjonspotensiale={riskAssessment.invationpotential.level}
                                ecoeffect={riskAssessment.ecoeffect.level}
                                invasjonUncertaintyLevels={riskAssessment.invationpotential.uncertaintyLevels}
                                ecoeffectUncertaintyLevels={riskAssessment.ecoeffect.uncertaintyLevels}/>
                            <h3>{riskAssessment.riskLevelText} <b> {riskAssessment.riskLevelCode}</b></h3>
                            <h4>{critlabels.decisiveCriteria}:
                                <b> {riskAssessment.decisiveCriteria}</b>
                            </h4>
                        </fieldset> :
                        <fieldset className="well">
                            <h3><b>{critlabels.notEvaluated}</b></h3>
                            <p>{critlabels.notEvaluated2}</p>
                            <p>{critlabels.notEvaluated3}</p>
                            <br />
                        </fieldset> }
                <br/>
                <div>
                    <fieldset className="well">
                        <h4>{critlabels.speciesDescription}</h4>
                        {/* <b>Slekt: {viewModel.navnabaseGenus}</b> */}
                       
                        {hasEcology
                            ? <p>{critlabels.ecology}: {
                                (kdi.limnic
                                ? (`${ltml("limnic")}`)
                                : "") +

                                (kdi.limnic && (kdi.terrestrial || kdi.marine || kdi.brackishWater)
                                    ? ", "
                                    : "") +
                                (kdi.terrestrial
                                ? (`${ltml("terrestrial")}`)
                                : "") +

                                (kdi.terrestrial && (kdi.marine || kdi.brackishWater)
                                ? ", "
                                    : "") +
                                (kdi.marine
                                ? (`${ltml("marine")}`)
                                : "") +

                                (kdi.marine && kdi.brackishWater
                                    ? ", "
                                    : "") +
                                (kdi.brackishWater
                                ? (`${ltml("brackishWater")}`)
                                : "")
                                }</p>
                            : <b className="missingInfo">{critlabels.missingEcology}</b>}
                        
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentationSpeciesStatus']}
                            style={{
                            //width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>
                    <fieldset className="well">
                        <h4>{critlabels.distribution} {appState.evaluationContext.nameWithPreposition}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentationDomesticSpread']}
                            style={{
                            //width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>
                    <fieldset className="well">
                        <h4>{critlabels.domesticSpread}</h4>
                        <p>{critlabels.see33And34}</p>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentationMigrationPathways']}
                            style={{
                            //width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>
                    {/*<div className="well">
                        <h4>Invasjonspotensial og økologisk effekt</h4>
                        <h4>Risiko: {riskAssessment.riskLevel.label}{"\u00a0\u00a0\u00a0"}{riskAssessment.riskLevel.decisiveCriteriaLabel.toLowerCase()} </h4>
                    </div>
                    <div className="well">
                        <h4>Kunnskapsgrunnlag og usikkerhet</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentation5']}
                            style={{
                                width: 800,
                                height: 150,
                                maxHeight: 150
                            }}
                        />
                    </div>*/}
                    <fieldset className="well">
                        <h4>{critlabels.invationPotential}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentationInvationPotential']}
                            style={{
                           // width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>
                    <fieldset className="well">
                        <h4>{critlabels.ecologicalEffect}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentationEcoEffect']}
                            style={{
                            //width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>

                    <fieldset className="well">
                        <h4>{critlabels.conclusion}</h4>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'criteriaDocumentation']}
                            style={{
                           // width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>
                    </fieldset>
                </div>
                <div>
                {/* appState.ekspertgruppe != null && appState.ekspertgruppeRolle && (appState.ekspertgruppeRolle.userName === "helgesan" || appState.ekspertgruppeRolle.userName === "olgah" || appState.ekspertgruppeRolle.userName === "Lisbeth Gederaas") */}
                    {appState.language === "NB" || appState.language === "SV"
                    ? <Xcomp.Button href={appState.AssessmentReportLink}>{critlabels.showSummary}</Xcomp.Button>
                    : null}
                </div>
                <div>
                    {appState.assessment.evaluationStatus !== 'finnished' 
                    && appState.ekspertgruppe !== null 
                    && appState.ekspertgruppeRolle 
                    && appState.ekspertgruppeRolle.admin
                    ? <div>{critlabels.assessmentUnderWork}<p/><Xcomp.Button onClick={() => this.setAssessmentComplete(appState)}>{critlabels.setComplete}</Xcomp.Button></div>
                    : null}
                    {appState.assessment.evaluationStatus === 'finnished' 
                    && appState.ekspertgruppe !== null 
                    && appState.ekspertgruppeRolle 
                    && appState.ekspertgruppeRolle.admin
                    ? <div>{critlabels.assessmentComplete}<p/><Xcomp.Button onClick={() => this.resetAssessmentComplete(appState)}>{critlabels.resetComplete}</Xcomp.Button></div>
                    : null}
                </div>
{/*() => appState.setAssessmentComplete(appState.vurdering)
                <div>
                    <h3>{critlabels.criteriaDocumentation}</h3>
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentationSpeciesStatus
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentationDomesticSpread
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentationMigrationPathways
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentationInvationPotential
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentationEcoEffect
                    }} />
                    <p
                        dangerouslySetInnerHTML={{
                        __html: riskAssessment.criteriaDocumentation
                    }} />
                </div>*/}
                {assessment.riskAssessment.riskLevelCode != null && assessment.previousAssessments[0] != null && category2018(assessment.previousAssessments[0].riskLevel) != assessment.riskAssessment.riskLevelCode &&
                <fieldset className="well">
                    <h3>{critlabels.reasonForChangeHeading}</h3>
                        <p> {critlabels.cat2023} {assessment.riskAssessment.riskLevelCode}</p>
                        <p> {critlabels.cat2018} {category2018(assessment.previousAssessments[0].riskLevel)}</p>
                       
                        <p>{critlabels.reasonForChange}</p> 
                        <Xcomp.MultiselectArray
                                observableValue={[assessment, 'reasonForChangeOfCategory']}                                 
                                codes={koder.reasonsForCategoryChange}
                                disabled={appState.userContext.readonly}
                                mode="check"/>
                        {/*<Xcomp.Bool
                            label='Reell endring i utbredelse, forekomstareal og/eller økologiske effekter'
                            observableValue={[assessment, 'reasonForChangeOfCategory']}/>
                         <Xcomp.Bool
                            label='Ny kunnskap'
                            observableValue={[assessment, 'reasonForChangeOfCategory']}/>
                         <Xcomp.Bool
                            label='Endrede kriterier, avgrensninger eller retningslinjer'
                            observableValue={[assessment, 'reasonForChangeOfCategory']}/>
                         <Xcomp.Bool
                            label='Ny tolkning av tidligere data'
                            observableValue={[assessment, 'reasonForChangeOfCategory']}/>
                        <Xcomp.Bool
                            label='Endret status (inkl. taksonomi, til/fra hjemlig)'
                        observableValue={[assessment, 'reasonForChangeOfCategory']}/> 

                        <p className="reasonsForChange">{labels.critDocumentation.reasonForChangeFrom2018} {assessment.reasonForChangeOfCategory != null ? assessment.reasonForChangeOfCategory.map(reason =>                            
                                       
                                       <li style={{marginLeft: '20px'}}>                                            
                                            {changeLabel(reason)}
                                        </li>                
                            ): null }</p>*/}

                        <p>{critlabels.detailedDescriptionOfTheReasons}</p>
                        <Xcomp.HtmlString
                            observableValue={[assessment, 'descriptionOfReasonsForChangeOfCategory']}
                            style={{
                           // width: 800,
                            height: 150,
                            maxHeight: 150
                        }}/>                           
                                     
                </fieldset>
                }

                <fieldset className="well">
                    <div>
                        <h3>Filvedlegg til vurderingen</h3>
                        <Documents/>
                    </div>
                </fieldset>

                        <Xcomp.Button>{critlabels.showAssessmentSummary}</Xcomp.Button>
                        {assessment.evaluationStatus != "finnished" ? 
                        <div>
                            <p>{critlabels.assessmentUnderWork}</p>
                            <Xcomp.Button>{critlabels.setComplete}</Xcomp.Button>
                         </div>: <p>{critlabels.assessmentCompleted}</p>}                       
                </div>
            </div>
        );
    }
}

// Vurdering55Kriteriedokumentasjon.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }
