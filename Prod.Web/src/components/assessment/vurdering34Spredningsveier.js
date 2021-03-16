// import config from '../../config';
import config from '../../config';
import React from 'react';
import {observer} from 'mobx-react';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import NewMigrationPathwaySelector from './34Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './34Spredningsveier/MigrationPathwayTable'
const labels = config.labels

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
        const result = vurdering.AssesmentVectors.remove(value);
        // console.log("item removed : " + result)
    };

    render() {
        const {vurdering, viewModel, fabModel} = this.props;
        const migrationPathways = vurdering.AssesmentVectors
        const migrationPathwayKoder = fabModel.spredningsveier.children.filter(child => child.name != "Import")
        const labels = fabModel.kodeLabels
        // console.log("''''''''''''''''''''''")
        // console.log(JSON.stringify(migrationPathwayKoder))
        const nbsp = "\u00a0"
        // console.log("fabModel" + fabModel.toString() )
        // console.log("koder" + fabModel.koder.toString() )
        const fjernSpredningsvei = (mp) => this.fjernSpredningsvei(vurdering, mp)
        return(
            <div>
                { true || config.showPageHeaders ? <h4 style={{marginTop: "25px"}} >{labels.MigrationPathway.introductionSpread}</h4> : <br />}
                <MPTable migrationPathways={migrationPathways} fabModel={fabModel} removeMigrationPathway={fjernSpredningsvei} showIntroductionSpread />
                <hr/>
                <div className="well">
                    <h4>Legg til spredningsveier</h4>
                    <NewMigrationPathwaySelector migrationPathways={migrationPathwayKoder} onSave={mp => this.saveMigrationPathway(vurdering, mp)} koder={fabModel.koder} labels={labels} />
                </div>
            </div>
        );
    }
}




Vurdering34Spredningsveier.propTypes = {
	viewModel: React.PropTypes.object.isRequired,
	vurdering: React.PropTypes.object.isRequired
}
