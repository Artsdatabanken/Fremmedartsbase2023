import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import {action, computed, extendObservable, observable} from 'mobx';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'
// const labels = config.labels

@observer
export default class NewMigrationPathwayButton extends React.Component {
    constructor(props) {
        super()

        extendObservable(this, {
            visibleModal: false,
            newMigrationPathway: {
                // Category : props.migrationPathway.parentValue ? props.migrationPathway.parentValue : props.migrationPathway.value,
                // CodeItem : props.migrationPathway.parentValue ? props.migrationPathway.value : null,
                CodeItem : props.migrationPathway.value,
                IntroductionSpread : null,
                InfluenceFactor : "unknown", 
                Magnitude : "unknown",
                TimeOfIncident : "unknown",
                ElaborateInformation : ""
            },
        })
        extendObservable(this, {
            okEnabled: () => !(
                this.newMigrationPathway.InfluenceFactor === "unknown" 
                && this.newMigrationPathway.Magnitude === "unknown" 
                && this.newMigrationPathway.TimeOfIncident === "unknown"
                && !this.newMigrationPathway.ElaborateInformation 
                )
        })
        this.showModal = () => this.visibleModal = true
        this.hideModal = (e) => {e.stopPropagation(); this.visibleModal = false}
        this.onOk = (e) => {
            this.hideModal(e)
            props.onSave(this.newMigrationPathway)
        }
    }


    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, labels} = this.props;
        const mplabels = labels.MigrationPathway
        // this.newMigrationPathway.Category = migrationPathway.name
        // try {
        //   console.log("koder4" + koder.toString() )
        // } 
        // catch (e) {console.log(e.message) }
        //  console.log("koder4b" + koder.migrationPathwayFrequency[0].Value )
        // const a = koder.migrationPathwayFrequency[0]
        return(

            <div className="btn-flat" style={{textTransform: "none"}} onClick={this.showModal} >{migrationPathway.name}
                {this.visibleModal ?
                <BsModal 
                    heading={migrationPathway.name} 
                    onCancel={this.hideModal} 
                    onOk={this.onOk} 
                    okEnabled={this.okEnabled}
                    labels={labels.General}
                >
                    {hideIntroductionSpread ? null :
                    <Xcomp.StringEnum label={mplabels.introductionSpread} observableValue={[this.newMigrationPathway, 'IntroductionSpread']} forceSync codes={koder.migrationPathwayIntroductionSpread}/>
                    }
                    <Xcomp.StringEnum label={mplabels.influenceFactor} observableValue={[this.newMigrationPathway, 'InfluenceFactor']} forceSync codes={koder.migrationPathwayFrequency}/>
                    <Xcomp.StringEnum label={mplabels.magnitude} observableValue={[this.newMigrationPathway, 'Magnitude']} forceSync codes={koder.migrationPathwayAbundance}/>
                    <Xcomp.StringEnum label={mplabels.timeOfIncident} observableValue={[this.newMigrationPathway, 'TimeOfIncident']} forceSync codes={koder.migrationPathwayTime}/>
                    <Xcomp.HtmlString label={mplabels.elaborateInformation} observableValue={[this.newMigrationPathway, 'ElaborateInformation']} />
                </BsModal> :
                null}
            </div>
        )}
}
