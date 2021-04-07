import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {autorun, extendObservable, observable} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'
import NaturtypeTable from './40Naturtyper/naturtypeTable';
import NewNaturetype from './40Naturtyper/newNaturetype';
// import NaturtypeSelector from './naturtypeSelector';
import RedlistedNaturetypeTable from './40Naturtyper/redlistedNaturetypeTable';
import NewRedlistedNaturetype from './40Naturtyper/newRedlistedNaturetype';
// import BsModal from './bootstrapModal' import RedlistedNaturtypeSelector from
// './40Naturtyper/redlistedNaturetypeSelector';

@observer
export default class Vurdering40Naturtyper extends React.Component {
    constructor(props) {
        super(props)
        const {vurdering, viewModel, fabModel} = this.props;

        // extendObservable(this, { })
        this.addNaturtype = (nyNt) => {
            vurdering
                .ImpactedNatureTypes
                .push(nyNt)
        }
        this.addRedlistedNaturetype = (nyNt) => {
            vurdering
                .RedlistedNatureTypes
                .push(nyNt)

            // alert("add new redlisted nature type: " + nyNt.RedlistedNatureTypeName + " -
            // " + nyNt.Category)
        }
    }

    render() {
        const {vurdering, viewModel, fabModel} = this.props;
        const riskAssessment = fabModel.activeRegionalRiskAssessment
        // const labels = config.labels.NatureType
        const labels = fabModel.kodeLabels
        const ntLabels = labels.NatureTypes
        const critC = getCriterion(riskAssessment, 0, "C")
        const critF = getCriterion(riskAssessment, 1, "F")
        const critG = getCriterion(riskAssessment, 1, "G")
        const nts = fabModel.naturtyper
        const doms = fabModel.dominansSkog
        const canRenderTable = !!fabModel.naturtypeLabels && (!!fabModel.dominansSkog || fabModel.language === "SV")
        return (
            <div>
                <br/>
                <br/>
                <h4>{ntLabels.colonizedAreaHeading}</h4>
                <br/>
                <NewNaturetype
                    fabModel={fabModel}
                    addNaturtype={this.addNaturtype}
                    labels={labels} />
                <br/>
                <NaturtypeTable
                    naturetypes={vurdering.ImpactedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    fabModel={fabModel}/>
                <br/>
                <br/>

                <fieldset className="well">
                    <h4>{ntLabels.critCHeading}</h4>
                    <p>{critC.info}</p>
                    <Criterion criterion={critC} mode="noheading"/>
                </fieldset>
                <fieldset className="well">
                    <h4>{ntLabels.critGHeading}</h4>
                    <p>{critG.info}</p>
                    <div>
                        <span>{fabModel.evaluationContext.name}:
                        </span>
                        <Xcomp.Bool
                            label='Dokumentert'
                            observableValue={[riskAssessment, 'CommonNatureTypesDomesticDocumented']}/>
                        <Xcomp.Bool
                            label='Observert'
                            observableValue={[riskAssessment, 'CommonNatureTypesDomesticObserved']}/>
                        <span>{ntLabels.commonNatureTypesAffectedDomestic} {fabModel.evaluationContext.nameWithPreposition}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CommonNatureTypesAffectedDomesticDescription']}/>
                    </div>
                    <br/>
                    <Criterion criterion={critG} mode="noheading"/>
                    <hr/>
                    <div>
                        <span>{ntLabels.abroad}:
                        </span>
                        <Xcomp.Bool
                        label={ntLabels.commonNatureTypesForeignDocumented}
                            observableValue={[riskAssessment, 'CommonNatureTypesForeignDocumented']}/> 
                        <br/>
                        <span>{ntLabels.commonNatureTypesAffectedAbroad}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'CommonNatureTypesAffectedAbroadDescription']}/>
                    </div>
                </fieldset>
                <hr/>
                <br/> 
                <h4>{ntLabels.effectOnThreatenedNatureTypes }</h4>
                <br/>
                <NewRedlistedNaturetype
                    fabModel={fabModel}
                    addNaturtype={this.addRedlistedNaturetype}
                    labels={labels}/>
                <br/>
                <br/>
                <RedlistedNaturetypeTable
                    naturetypes={vurdering.RedlistedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    fabModel={fabModel}/>
                <br/>
                <br/>
                <fieldset className="well">
                    <h4>{ntLabels.critFHeading}</h4>
                    <p>{critF.info}</p>
                    <div>
                        <span>{fabModel.evaluationContext.name}:
                        </span>
                        <Xcomp.Bool
                            label='Dokumentert'
                            observableValue={[riskAssessment, 'ThreatenedNatureTypesDomesticDocumented']}/>
                        <Xcomp.Bool
                            label='Observert'
                            observableValue={[riskAssessment, 'ThreatenedNatureTypesDomesticObserved']}/>
                        <span>{ntLabels.threatenedNatureTypesChangeDomestic} {fabModel.evaluationContext.nameWithPreposition}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'ThreatenedNatureTypesAffectedDomesticDescription']}/>
                    </div>
                    <br/>
                    <Criterion criterion={critF} mode="noheading"/>
                    <hr/>
                    <div>
                        <span>{ntLabels.abroad}:
                        </span>
                        <Xcomp.Bool
                        label={ntLabels.threatenedNatureTypesForeignDocumented}
                            observableValue={[riskAssessment, 'ThreatenedNatureTypesForeignDocumented']}/> 
                        <br/>
                        <span>{ntLabels.threatenedNatureTypesChangeAbroad}</span>
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'ThreatenedNatureTypesAffectedAbroadDescription']}/>
                    </div>
                </fieldset>
                <br/>
                <fieldset className="well">
                    <h4>{ntLabels.parasiteHabitat}</h4>
                    <div>
                        <Xcomp.Bool
                            label={ntLabels.usesLivingSpeciesAsHabitat}
                            observableValue={[vurdering, 'UsesLivingSpeciesAsHabitat']}/> 
                        {vurdering.UsesLivingSpeciesAsHabitat ?
                        <Xcomp.String
                            label={ntLabels.usesLivingSpeciesAsHabitatScientificName}
                            observableValue={[vurdering, 'UsesLivingSpeciesAsHabitatScientificName']}/> :
                        null }
                    </div>
                    <br/>
                </fieldset>
                <br/>
                <br/>
                <br/>
            </div>
        );
    }
}

Vurdering40Naturtyper.propTypes = {
    fabModel: PropTypes.object.isRequired,
    viewModel: PropTypes.object.isRequired,
    vurdering: PropTypes.object.isRequired
}
