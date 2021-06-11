import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import * as Xcomp from './observableComponents';
import Vurdering34Spredningsveier from './vurdering34Spredningsveier'
import NewMigrationPathwaySelector from './34Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './34Spredningsveier/MigrationPathwayTable'
const labels = config.labels

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
        const {appState:{assessment:{riskAssessment}}, appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder

        // const {vurdering, viewModel, fabModel} = this.props;
        // const labels = fabModel.kodeLabels
        const importPathways = vurdering.importPathways
        const importPathwayKoder = appState.spredningsveier.children.filter(child => child.name === "Import")
        const nbsp = "\u00a0"
        const removeImportPathway = (mp) => this.removeImportPathway(vurdering, mp)

        return(
            <div>
                <p>Kommer arten (utelukkende eller også) til norsk natur via innendørs- eller produksjonsareal?</p>
                <SelectableRadio
                            label={labels.indoorProduktionImport.a}
                            value={"positive"}
                            observableValue={[riskAssessment, "indoorProduktion"]}/>
                    <SelectableRadio
                            label={labels.indoorProduktionImport.b}
                            value={"negative"}
                            observableValue={[riskAssessment, "indoorProduktion"]}/>
               
                <Vurdering34Spredningsveier  name={"Til innendørs- eller produksjonsareal"} furtherInfo={labels.Import.furtherInfoIndoors}/>
                
                <Vurdering34Spredningsveier name={"Introduksjon til natur"} furtherInfo={labels.Import.furtherInfoIntro}/>
                {/*<table className="table">
                    <thead>
                        <tr>
                            <th>{labels.MigrationPathway.mainCategory}</th>
                            <th>{labels.MigrationPathway.category}</th>
                            <th>{labels.MigrationPathway.influenceFactor}</th>
                            <th>{labels.MigrationPathway.magnitude}</th>
                            <th>{labels.MigrationPathway.timeOfIncident}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                                <button className="btn btn-primary btn-xs" disabled>Fjern</button>
                            </td>
                        </tr>
                    </tbody>
        </table>*/}
               
                <Vurdering34Spredningsveier name={"Videre spredning i natur"} furtherInfo={labels.Import.furtherInfoNature}/>
                {config.showPageHeaders ? <h3>{labels.Import.importIndoor}</h3> : <br />}
               {/*} <Xcomp.Bool label="" observableValue={[vurdering, "importedToIndoorOrProductionArea"]} />
                <h4 style={{display: "inline-block", marginLeft: "6px" }}>{labels.Import.importIndoor}</h4>
                {vurdering.importedToIndoorOrProductionArea && 
                <div>
                    <MPTable migrationPathways={importPathways} removeMigrationPathway={removeImportPathway} />
                    <hr/>
                    <div className="well">
                        <h4>{labels.Import.importAdd}</h4>
                        <NewMigrationPathwaySelector migrationPathways={importPathwayKoder} onSave={mp => this.saveImportPathway(vurdering, mp)} koder={koder} hideIntroductionSpread labels={labels}/>
                    </div>
                </div>} */}
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
