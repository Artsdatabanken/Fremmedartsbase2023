import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import * as Xcomp from './observableComponents';
import NewMigrationPathwaySelector from './34Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './34Spredningsveier/MigrationPathwayTable'
const labels = config.labels
@observer
export default class Vurdering33Import extends React.Component {
    constructor(props) {
        super(props);
    }
    @action saveImportPathway(vurdering, mp) {
        const mps = vurdering.ImportPathways
        const compstr = (mp) => `${mp.CodeItem}${mp.InfluenceFactor}${mp.Magnitude}${mp.TimeOfIncident}`
        const newMp = compstr(mp)
        const existing = mps.filter(oldMp =>  compstr(oldMp) === newMp
        )
        if (existing.length > 0) {
            console.log("Importvei finnes allerede i vurderingen")
        } else {
            const clone = toJS(mp)
            mps.push(clone); // must use clone to avoid that multiple items in the list is the same instance! 
        }
    }

    @action removeImportPathway = (vurdering, value) => {
        const result = vurdering.ImportPathways.remove(value);
        // console.log("item removed : " + result)
    };

    render() {
        const {vurdering, viewModel, fabModel} = this.props;
        const labels = fabModel.kodeLabels
        const importPathways = vurdering.ImportPathways
        const importPathwayKoder = fabModel.spredningsveier.children.filter(child => child.name === "Import")
        const nbsp = "\u00a0"
        const removeImportPathway = (mp) => this.removeImportPathway(vurdering, mp)

        return(
            <div>
                {config.showPageHeaders ? <h3>{labels.Import.importIndoor}</h3> : <br />}
                <Xcomp.Bool label="" observableValue={[vurdering, "ImportedToIndoorOrProductionArea"]} />
                <h4 style={{display: "inline-block", marginLeft: "6px" }}>{labels.Import.importIndoor}</h4>
                {vurdering.ImportedToIndoorOrProductionArea && 
                <div>
                    <MPTable migrationPathways={importPathways} fabModel={fabModel} removeMigrationPathway={removeImportPathway} />
                    <hr/>
                    <div className="well">
                        <h4>{labels.Import.importAdd}</h4>
                        <NewMigrationPathwaySelector migrationPathways={importPathwayKoder} onSave={mp => this.saveImportPathway(vurdering, mp)} koder={fabModel.koder} hideIntroductionSpread labels={labels}/>
                    </div>
                </div>}
            </div>
        )
    }
}

/*Support for evaluationcontext så sånn ut:
<h3>Importert til Innendørs-{fabModel.evaluationContext.name} eller produsksjonsareal</h3>*/


Vurdering33Import.propTypes = {
	viewModel: PropTypes.object.isRequired,
	vurdering: PropTypes.object.isRequired
}
