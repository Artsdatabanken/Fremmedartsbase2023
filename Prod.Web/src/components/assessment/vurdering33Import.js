import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import * as Xcomp from './observableComponents';
import NewMigrationPathwaySelector from './34Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './34Spredningsveier/MigrationPathwayTable'
const labels = config.labels

@inject("appState")
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
        const result = vurdering.importPathways.remove(value);
        // console.log("item removed : " + result)
    };

    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder.Children

        // const {vurdering, viewModel, fabModel} = this.props;
        // const labels = fabModel.kodeLabels
        const importPathways = vurdering.importPathways
        const importPathwayKoder = appState.spredningsveier.children.filter(child => child.name === "Import")
        const nbsp = "\u00a0"
        const removeImportPathway = (mp) => this.removeImportPathway(vurdering, mp)

        return(
            <div>
                {config.showPageHeaders ? <h3>{labels.Import.importIndoor}</h3> : <br />}
                <Xcomp.Bool label="" observableValue={[vurdering, "importedToIndoorOrProductionArea"]} />
                <h4 style={{display: "inline-block", marginLeft: "6px" }}>{labels.Import.importIndoor}</h4>
                {vurdering.importedToIndoorOrProductionArea && 
                <div>
                    <MPTable migrationPathways={importPathways} removeMigrationPathway={removeImportPathway} />
                    <hr/>
                    <div className="well">
                        <h4>{labels.Import.importAdd}</h4>
                        <NewMigrationPathwaySelector migrationPathways={importPathwayKoder} onSave={mp => this.saveImportPathway(vurdering, mp)} koder={koder} hideIntroductionSpread labels={labels}/>
                    </div>
                </div>}
            </div>
        )
    }
}

/*Support for evaluationcontext så sånn ut:
<h3>Importert til Innendørs-{fabModel.evaluationContext.name} eller produsksjonsareal</h3>*/


// Vurdering33Import.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
