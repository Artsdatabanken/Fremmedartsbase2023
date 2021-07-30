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
                introductionSpread : null,
                influenceFactor : "unknown", 
                magnitude : "unknown",
                timeOfIncident : "unknown",
                elaborateInformation : ""
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
       // this.showModal = () => this.visibleModal = true

       this.showModal = (e) => {
            action(() => {
                e.stopPropagation();
                this.visibleModal = !this.visibleModal
            })()
        }
      

        this.hideModal = (e) => {e.stopPropagation(); this.visibleModal = false}
        this.onOk = (e) => {
            this.hideModal(e)
            props.onSave(this.newMigrationPathway)
        }
    }


    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, disabled, labels, mainCodes} = this.props;
        const mplabels = labels.MigrationPathway
        //console.log(migrationPathway)
        // this.newMigrationPathway.Category = migrationPathway.name
        // try {
        //   console.log("koder4" + koder.toString() )
        // } 
        // catch (e) {console.log(e.message) }
        //  console.log("koder4b" + koder.migrationPathwayFrequency[0].Value )
        // const a = koder.migrationPathwayFrequency[0]
        return(

            <div className="btn-flat btn" disabled={disabled} style={{textTransform: "none"}} onClick={this.showModal} >{migrationPathway.name}
                {this.visibleModal ?
                <BsModal 
                    heading={migrationPathway.name} 
                    onCancel={this.hideModal} 
                    onOk={this.onOk} 
                    okEnabled={this.okEnabled}
                    labels={labels.General}
                    children={migrationPathway.children}>
                    
                    {/*<Xcomp.StringEnum observableValue={[this.newMigrationPathway, 'codeItem']} mode="radio" codes={migrationPathway.children}/>*/}
            
               {hideIntroductionSpread ? null :
                <Xcomp.StringEnum label={mplabels.introductionSpread} observableValue={[this.newMigrationPathway, 'introductionSpread']} forceSync codes={mainCodes.migrationPathwayIntroductionSpread}/>
                }
                <Xcomp.StringEnum label={mplabels.influenceFactor} observableValue={[this.newMigrationPathway, 'influenceFactor']} forceSync codes={mainCodes.migrationPathwayFrequency}/>
                <Xcomp.StringEnum label={mplabels.magnitude} observableValue={[this.newMigrationPathway, 'magnitude']} forceSync codes={mainCodes.migrationPathwayAbundance}/>
                <Xcomp.StringEnum label={mplabels.timeOfIncident} observableValue={[this.newMigrationPathway, 'timeOfIncident']} forceSync codes={mainCodes.migrationPathwayTime}/>
            <Xcomp.HtmlString label={mplabels.elaborateInformation} observableValue={[this.newMigrationPathway, 'elaborateInformation']} /> 
            </BsModal> :
                null}
                
                 
            </div>
        )}
}
