// import config from '../../config';
import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';

import * as Xcomp from './observableComponents';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import NewMigrationPathwaySelector from './40Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './40Spredningsveier/MigrationPathwayTable'
const labels = config.labels

@inject("appState")
@observer
export default class Vurdering34Spredningsveier extends React.Component {
    constructor(props) {
        super(props);
        extendObservable(this, {
        })
    }

    @action saveMigrationPathway(vurdering, mp) {
        const mps = vurdering.AssesmentVectors
        const compstr = (mp) => ""+mp.CodeItem+mp.IntroductionSpread+mp.InfluenceFactor+mp.Magnitude+mp.TimeOfIncident
        const newMp = compstr(mp)
        const existing = mps.filter(oldMp =>  compstr(oldMp) === newMp
        )
        if (existing.length > 0) {
            console.log("Spredningsvei finnes allerede i vurderingen")
        } else {
            const clone = toJS(mp)
            mps.push(clone); // must use clone to avoid that multiple items in the list is the same instance! 
        }
        // this.showEditMigrationPathway = false;
    }


    @action fjernSpredningsvei = (vurdering, value) => {
        const result = vurdering.assesmentVectors.remove(value);
        // console.log("item removed : " + result)
    };

    render() {
        const {appState:{assessment:{riskAssessment}}, appState:{assessment}, appState, name, furtherInfo} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder
        const importationCodes = name == "Til innendørs- eller produksjonsareal" ? koder.migrationPathways[0].Children.mp[0].Children.mpimport : 
                                name == "Introduksjon til natur" ? koder.migrationPathways[0].Children.mp[0].Children.mpimportation : 
                                name == "Videre spredning i natur" ? koder.migrationPathways[0].Children.mp[0].Children.mpspread : null 
        // const {vurdering, viewModel, fabModel} = this.props;
        const migrationPathways = assessment.assesmentVectors
        //const migrationPathwayKoder = appState.spredningsveier.children.filter(child => child.name != "Import")
        const migrationPathwayKoder = name == "Til innendørs- eller produksjonsareal" ? appState.spredningsveier.children.filter(child => child.name == "Import") :
                                     name == "Videre spredning i natur" ? appState.spredningsveier.children.filter(child => child.name == "Videre spredning" || child.name == "Spredning")
                                        : appState.spredningsveier.children.filter(child => child.name != "Import" && child.name != "Videre spredning")

        //console.log(appState.spredningsveier.children)
        // const labels = fabModel.kodeLabels
        // console.log("''''''''''''''''''''''")
        // console.log(JSON.stringify(migrationPathwayKoder))
        const nbsp = "\u00a0"
        // console.log("fabModel" + fabModel.toString() )
        // console.log("koder" + fabModel.koder.toString() )
        const fjernSpredningsvei = (mp) => this.fjernSpredningsvei(vurdering, mp)
        return(
            <div>
               {/* { true || config.showPageHeaders ? <h4 style={{marginTop: "25px"}} >{labels.MigrationPathway.introductionSpread}</h4> : <br />} */}
                <h3>{name}</h3>
                <MPTable migrationPathways={migrationPathways} removeMigrationPathway={fjernSpredningsvei} showIntroductionSpread />
                <hr/>
                <div className="well">
                    <h4>Legg til spredningsvei</h4>
                    <NewMigrationPathwaySelector migrationPathways={migrationPathwayKoder} onSave={mp => this.saveMigrationPathway(vurdering, mp)} mainCodes={koder} koder={importationCodes} labels={labels} />
                </div>
                <button className="btn btn-primary">Se definisjoner</button>
                <p>{furtherInfo}</p>
                <i>{labels.Import.furtherInfoComment}</i>
                <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "furtherInfoAboutImport"]}
                                //label={labels.DEcrit.insecurity}
                                />
            </div>
        );
    }
}




// Vurdering34Spredningsveier.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
