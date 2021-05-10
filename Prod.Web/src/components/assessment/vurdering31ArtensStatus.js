import React from 'react';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import config from '../../config';
// import RadioGroup from './radioGroup'
import * as Xcomp from './observableComponents';
import DomesticObservedAndEstablished from './31ArtensStatus/DomesticObservedAndEstablished';

// const labels = config.labels
// const standardPeriods = [
//     nbsp,
//     "-1800",
//     "1800-1849",
//     "1850-1899",
//     "1900-1949",
//     "1950-1959",
//     "1960-1969",
//     "1970-1979",
//     "1980-1989",
//     "1990-1999",
//     "2000-2009",
//     "2010-",
//     "Vet ikke"
// ];

const SkalVurderesLabel = ({skalVurderes}) => (skalVurderes
    ? <label>
            Arten skal risikovurderes videre</label>
: <label className="important-info">Arter som faller innenfor denne gruppen skal ikke risikovurderes videre</label>)

const nbsp = "\u00a0"

@inject("appState")
@observer
export default class vurdering31ArtensStatus extends React.Component {
// @observer
//     constructor(props) {
//         super(props)

//     }



    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels



        // console.log("labels" + JSON.stringify(labels.FirstObservation))

        const koder = appState.koder.Children
        const standardPeriods = [
            nbsp,
            "-1800",
            "1800-1849",
            "1850-1899",
            "1900-1949",
            "1950-1959",
            "1960-1969",
            "1970-1979",
            "1980-1989",
            "1990-1999",
            "2000-2009",
            "2010-",
            labels.FirstObservation.dontknow
        ];

        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Artens status</h3>
                    : <br/>}

                <Xcomp.Radio
                     kode={koder.AlienSpeciesCategory[0]}
                    //kode={labels.AlienSpeciesCategory[0]}
                    observableValue={[vurdering, "AlienSpeciesCategory"]}/>
                    {vurdering.AlienSpeciesCategory === 'AlienSpecie' ?
                    <div className="well">
                        <Xcomp.Bool
                            label={labels.StatusUncertainty.uncertainIfEstablishedBefore1800}
                            observableValue={[vurdering, 'AlienSpecieUncertainIfEstablishedBefore1800']}/>
                        <Xcomp.Bool
                            label={labels.StatusUncertainty.uncertainAntropochor}
                            observableValue={[vurdering, 'AlienSpecieUncertainAntropochor']}/> 
                        {vurdering.AlienSpecieUncertainIfEstablishedBefore1800 || vurdering.AlienSpecieUncertainAntropochor
                            ? <Xcomp.HtmlString
                                    observableValue={[vurdering, 'AlienSpecieUncertainDescription']}
                                    label={labels.StatusUncertainty.uncertainDescription}/>
                            : null}
                        </div>
                    : null}
                <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[4]}
                    observableValue={[vurdering, "AlienSpeciesCategory"]}/>
                <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[1]}
                    observableValue={[vurdering, "AlienSpeciesCategory"]}/> 
                    {vurdering.AlienSpeciesCategory === 'DoorKnocker'
                    ? <div className="well">
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'DoorKnockerCategory']}
                                codes={koder.DoorKnocker}
                                mode="radio"
                                forceSync/>
                            <br/> 
                            {appState.skalVurderes
                                ? null
                                : <div>
                                    <Xcomp.HtmlString
                                        observableValue={[vurdering, 'DoorKnockerDescription']}
                                        //label="Nærmere begrunnelse"/>
                                        label={labels.StatusUncertainty.furtherSpecification}/>
                                    <br/>
                                </div>}
                        </div>
                    : null}
                {appState.regionalRiskAssessmentEnabled
                ? <div>
                    <Xcomp.Radio
                        kode={koder.AlienSpeciesCategory[2]}
                        observableValue={[vurdering, "AlienSpeciesCategory"]}/> 
                        {vurdering.AlienSpeciesCategory === 'RegionallyAlien' 
                        ? <div className="well">
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'RegionallyAlienCategory']}
                                codes={koder.RegionallyAlien}
                                mode="radio"
                                forceSync/>
                        </div> 
                        : null}
                </div>
                : null}
                <Xcomp.Radio
                    kode={koder.AlienSpeciesCategory[3]}
                    observableValue={[vurdering, "AlienSpeciesCategory"]}/> 
                    {vurdering.AlienSpeciesCategory === 'NotApplicable'
                    ? <div
                            className="well"
                            style={{
                            backgroundColor: "#FDFCFC",
                            paddingTop: "3px",
                            paddingBottom: "3px",
                            paddingLeft: "15px",
                            paddingRight: "15px",
                            marginTop: "15px"
                        }}>
                            <Xcomp.StringEnum
                                observableValue={[vurdering, 'NotApplicableCategory']}
                                codes={koder.NotApplicable}
                                mode="radio"
                                forceSync/> {!appState.skalVurderes
                                ? <div>
                                        <Xcomp.HtmlString
                                            observableValue={[vurdering, 'AssesmentNotApplicableDescription']}
                                            //label="Nærmere begrunnelse"/>
                                            label={labels.StatusUncertainty.furtherSpecification}/>
                                        <br/>
                                    </div>
                                : null}
                        </div>
                    : null}
                {!(['AlienSpecie', 'DoorKnocker', 'RegionallyAlien', 'NotApplicable', 'EcoEffectWithoutEstablishment'].includes(vurdering.AlienSpeciesCategory))
                    ? <div className="well">Sett artens status før du går videre</div>
                    : null}
                <hr/>
                <br/>
                <div className="well">
                    {vurdering.AlienSpeciesCategory === 'RegionallyAlien'
                        ? <h4>{labels.FirstObservation.firstregionalobservation} {appState.evaluationContext[assessment.EvaluationContext].nameWithPreposition}</h4>
                        : <h4>{labels.FirstObservation.firstobservation} {appState.evaluationContext.nameWithPreposition}</h4>}
                    {/*<div style={{width: "190px"}}><Xcomp.StringCombobox observableValue={[vurdering, 'FirstDomesticEstablishmentObserved']} selectableValues={standardPeriods} /></div>*/}
                    <div style={{
                        width: "190px"
                    }}><Xcomp.StringCombobox
                        observableValue={[vurdering, 'FirstDomesticObservation']}
                        selectableValues={standardPeriods}/></div>
                    <DomesticObservedAndEstablished
                        observedAndEstablishedStatusInNorway={vurdering.observedAndEstablishedStatusInCountry}
                        koder={koder}
                        labels={labels.FirstObservation}
                        showIndividualCount={appState.isVKM}/>
                </div>
                <br/>
                <div className="well">
                    <table className="formtable">
                        <thead>
                            <tr>
                                <th colSpan="2">
                                    <h4>{labels.PreviousAssessment.previousassessment} </h4>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                    whiteSpace: "nowrap",
                                    textTransform: "capitalize"
                                }}>{labels.PreviousAssessment.domestic}</td>
                                <td><Xcomp.Bool observableValue={[vurdering, 'DomesticRiskEvaluationExists']}/></td>
                            </tr>
                            <tr>
                                <td>{labels.PreviousAssessment.abroad}</td>
                                <td>
                                    <div>
                                        {/* <RadioGroup
                                            name="foreignRiskEvaluationExists"
                                            selectedValue={vurdering.ForeignRiskEvaluationExists}
                                            onChange={e => vurdering.ForeignRiskEvaluationExists = e}>
                                            {Radio => (
                                                <div>
                                                    <Radio value/>{`${nbsp}${labels.General.yes}${nbsp}${nbsp}`}
                                                    <Radio value={false}/>{`${nbsp}${labels.General.no}${nbsp}${nbsp}`}
                                                    <Radio value={null}/>{`${nbsp}${labels.General.unknown}${nbsp}${nbsp}`}
                                                </div>
                                            )}
                                        </RadioGroup> */}
                                    </div>
                                </td>
                            </tr>
                            {vurdering.ForeignRiskEvaluationExists === true
                                ? <tr>
                                        <td/>
                                        <td>
                                            <div>
                                                <span>{"Beskriv:"}</span>
                                                <br/>
                                                <Xcomp.HtmlString
                                                    observableValue={[vurdering, 'ForeignRiskEvaluationComment']}/>
                                            </div>
                                        </td>
                                    </tr>
                                : null}
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }
}

// vurdering31ArtensStatus.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     vurdering: PropTypes.object.isRequired
// }
