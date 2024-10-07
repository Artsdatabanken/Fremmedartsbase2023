import config from '../../config';
import React from 'react';
import { observer, inject } from 'mobx-react';
import { action, toJS, makeObservable } from 'mobx';
import * as Xcomp from './observableComponents';
import Assessment42Spredningsveier from './assessment42Spredningsveier'

class Assessment41Import extends React.Component {
    constructor(props) {
        super(props);

        makeObservable(this, {
            saveImportPathway: action
        });
    }
    saveImportPathway(vurdering, mp) {
        const mps = vurdering.ImportPathways
        const compstr = (mp) => `${mp.codeItem}${mp.influenceFactor}${mp.magnitude}${mp.timeOfIncident}`
        const newMp = compstr(mp)
        const existing = mps.filter(oldMp => compstr(oldMp) === newMp
        )
        if (existing.length > 0) {
            console.log("Importvei finnes allerede i vurderingen")
        } else {
            const clone = toJS(mp)
            mps.push(clone); // must use clone to avoid that multiple items in the list is the same instance!
        }
    }

    render() {
        const { appState: { assessment: { riskAssessment } }, appState: { assessment }, appState } = this.props;
        const labels = appState.codeLabels
        const disabled = appState.userContext.readonly
        const nbsp = "\u00a0"

        return (
            <div>
                <br />
                <fieldset className="well">
                    <h2>{labels.MigrationPathway.heading}</h2>
                    <div>
                        <p style={{ marginLeft: '20px' }}>Spres arten utelukkende direkte til norsk natur (uten å gå veien om innendørsareal eller artens eget produksjonsareal)?</p>
                        <Xcomp.Radio
                            label={labels.indoorProduktionImport.a}
                            value={"positive"}
                            disabled={disabled}
                            observableValue={[assessment, "indoorProduktion"]} />
                        <Xcomp.Radio
                            label={labels.indoorProduktionImport.b}
                            value={"negative"}
                            disabled={disabled}
                            observableValue={[assessment, "indoorProduktion"]} />
                    </div>
                </fieldset>
                {assessment.indoorProduktion != null &&
                    <div>
                        {assessment.indoorProduktion == "negative"
                            ? <>
                                <Assessment42Spredningsveier name={"Til innendørs- eller produksjonsareal"} furtherInfo={labels.Import.furtherInfoIndoors} />
                            </>
                            : null}
                        <Assessment42Spredningsveier name={"Introduksjon til natur"} furtherInfo={labels.Import.furtherInfoIntro} />
                        <Assessment42Spredningsveier name={"Videre spredning i natur"} furtherInfo={labels.Import.furtherInfoNature} />
                    </div>
                }
                {config.showPageHeaders ? <h3>{labels.Import.importIndoor}</h3> : <br />}
            </div>
        )
    }
}

export default inject("appState")(observer(Assessment41Import));
