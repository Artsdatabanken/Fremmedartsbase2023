// import config from '../../../config';
import React from 'react';
import { observer } from 'mobx-react';
import { action, extendObservable } from 'mobx';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'

class NewMigrationPathwayButton extends React.Component {
    constructor(props) {
        super()

        extendObservable(this, {
            visibleModal: false,
            newMigrationPathway: {
                mainCategory: props.mainCat,
                category: props.migrationPathway.name,
                codeItem: props.migrationPathway.value,
                introductionSpread: null,
                influenceFactor: "",
                magnitude: "",
                timeOfIncident: "",
                elaborateInformation: ""
            },
        })
        extendObservable(this, {
            okEnabled: () => !(
                this.newMigrationPathway.influenceFactor === "unknown"
                && this.newMigrationPathway.magnitude === "unknown"
                && this.newMigrationPathway.timeOfIncident === "unknown"
            )
        })

        this.showModal = (e) => {
            action(() => {
                e.stopPropagation();
                this.visibleModal = true;
            })()
        }


        this.hideModal = action((e) => { e.stopPropagation(); this.visibleModal = false })
        this.onOk = action((e) => {
            this.hideModal(e)
            props.onSave(this.newMigrationPathway)
        })
    }


    render() {
        const { migrationPathway, onSave, koder, hideIntroductionSpread, disabled, labels, mainCodes, mainCat } = this.props;
        const mplabels = labels.MigrationPathway
        const disable = disabled && (migrationPathway.name != "direkte til forbruker per post" && migrationPathway.name != "privatpersoners egenimport" && migrationPathway.name != "med annet formål" && migrationPathway.name != "øvrig rømning/forvilling" && migrationPathway.name != "fra forskning" && migrationPathway.name != "til forskning" && migrationPathway.name != "fra botaniske/zoologiske hager / akvarier (ikke privat)" && migrationPathway.name != "til botaniske/zoologiske hager / akvarier (ikke privat)")
        const heading = mainCat + " " + migrationPathway.name
        return (

            <div className="btn-flat btn migration" disabled={disable} style={{ textTransform: "none" }} onClick={this.showModal} >{migrationPathway.name}
                {this.visibleModal
                    ? <BsModal
                        heading={heading}
                        onCancel={this.hideModal}
                        onOk={this.onOk}
                        okEnabled={this.okEnabled}
                        labels={labels.General}
                        children={migrationPathway.children}>
                        {hideIntroductionSpread
                            ? null
                            : <Xcomp.StringEnum
                                label={mplabels.introductionSpread}
                                className="intro"
                                observableValue={[this.newMigrationPathway, 'introductionSpread']}
                                forceSync
                                codes={mainCodes.migrationPathwayIntroductionSpread} />}

                        <Xcomp.StringEnum
                            label={mplabels.influenceFactor}
                            observableValue={[this.newMigrationPathway, 'influenceFactor']}
                            forceSync
                            codes={mainCodes.migrationPathwayFrequency} />
                        <Xcomp.StringEnum
                            label={mplabels.magnitude}
                            observableValue={[this.newMigrationPathway, 'magnitude']}
                            forceSync
                            codes={mainCodes.migrationPathwayAbundance} />
                        <Xcomp.StringEnum
                            label={mplabels.timeOfIncident}
                            observableValue={[this.newMigrationPathway, 'timeOfIncident']}
                            forceSync
                            codes={mainCodes.migrationPathwayTime} />
                    </BsModal>
                    : null}
            </div>
        )
    }
}

export default observer(NewMigrationPathwayButton);
