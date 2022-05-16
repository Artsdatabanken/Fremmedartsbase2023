import config from '../../config';
import React from 'react';
import {observer, inject} from 'mobx-react';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import * as Xcomp from './observableComponents';
import Assessment42Spredningsveier from './assessment42Spredningsveier'
const labels = config.labels


@inject("appState")
@observer
export default class Assessment41Import extends React.Component {
    constructor(props) {
        super(props);
    }
    @action saveImportPathway(vurdering, mp) {
        const mps = vurdering.ImportPathways
        const compstr = (mp) => `${mp.codeItem}${mp.influenceFactor}${mp.magnitude}${mp.timeOfIncident}`
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
        const disabled = appState.userContext.readonly
        // const importPathways = vurdering.importPathways
        // const importPathwayKoder = appState.spredningsveier.children.filter(child => child.name === "Import")
        const nbsp = "\u00a0"
        const removeImportPathway = (mp) => this.removeImportPathway(vurdering, mp)

        return(
        <div>
            <br/>
            <fieldset className="well">
                <h2>{labels.MigrationPathway.heading}</h2>
                <div>
                <p style={{marginLeft: '20px'}}>Spres arten utelukkende direkte til norsk natur (uten å gå veien om innendørsareal eller artens eget produksjonsareal)?</p>
                <Xcomp.Radio
                            label={labels.indoorProduktionImport.a}
                            value={"positive"}
                            //defaultChecked = {assessment.importedToIndoorOrProductionArea}
                            disabled = {disabled}
                            observableValue={[assessment, "indoorProduktion"]}/>
                <Xcomp.Radio
                            label={labels.indoorProduktionImport.b}
                            value={"negative"}
                            disabled = {disabled}
                            observableValue={[assessment, "indoorProduktion"]}/>
                </div>
                </fieldset>
                    {assessment.indoorProduktion != null &&
                    <div>
                        {assessment.indoorProduktion == "negative" 
                                ? <>  
                                    <Assessment42Spredningsveier  name={"Til innendørs- eller produksjonsareal"} furtherInfo={labels.Import.furtherInfoIndoors}/>  
                                  </>
                                : null
                        }
                            <Assessment42Spredningsveier name={"Introduksjon til natur"} furtherInfo={labels.Import.furtherInfoIntro}/>
                            <Assessment42Spredningsveier name={"Videre spredning i natur"} furtherInfo={labels.Import.furtherInfoNature}/>
                     </div>
                    }
                {config.showPageHeaders ? <h3>{labels.Import.importIndoor}</h3> : <br />}
        </div>
        )
    }
}
