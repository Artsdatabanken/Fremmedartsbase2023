// import config from '../../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import {action, computed, extendObservable, observable} from 'mobx';
// import * as Xcomp from '../observableComponents';
// import BsModal from '../bootstrapModal'
// const labels = config.labels

import NewMigrationPathwayButton from './NewMigrationPathwayButton'
import assessmentTabdefs from '../assessmentTabdefs';


@observer
export default class NewMigrationPathwayGroup extends React.Component {

    constructor(props) {
        super(props);
        extendObservable(this, {
            expandPathways: false,
        })

        this.togglePathways = () => {
            action(() => {
               // e.stopPropagation();
                this.expandPathways = !this.expandPathways
                console.log(this.expandPathways)
            })()
        }
    }

    @observable expanded = false;
    expand() {
        console.log(JSON.stringify(this.context))
        if(this.context.readonly) return
        this.expanded = !this.expanded
    }
    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, labels, vurdering, mainCodes} = this.props;
        //  console.log("koder3" + koder.toString() )

        const hasChildren = migrationPathway.children && migrationPathway.children.length > 0 
        
            // <div className="clearfix col-lg-4 col-md-6 col-sm-8 col-xs-12">
        //todo: fix data for "egenspredning". remove the invalid child
        return(
            <div style={{maxWidth: "600px"}}>
                <div className="panel panel-default compact">
                    <div className="panel-heading compact" onClick={migrationPathway.value === null ? ()=> this.expand() : null}>
                        {hasChildren ? 
                        <div style={{float: "right"}} onClick={ (e)=> {e.stopPropagation(); this.expand(); this.togglePathways()}}><span className={"glyphicon glyphicon-chevron-" + (this.expanded ? "up" : "down")}></span></div> : null}
                       {/* {migrationPathway.value === null ? */}
                        <Xcomp.Button onClick={()=> {this.togglePathways()}}>{migrationPathway.name} </Xcomp.Button>             
                        {/* :  <NewMigrationPathwayButton migrationPathway={migrationPathway} onSave={onSave} koder={koder}  mainCodes={mainCodes} hideIntroductionSpread labels={labels}/>
                        } */}
                    </div>
                    <div className={"panel-collapse" + (!this.expandPathways ? " collapse" : this.expanded ? " in" : "")}
                     aria-hidden="false"
                     >
                        <div className="panel-body">
                            <ul>
                            {migrationPathway.children.map(child => {
                                {/*child.parentValue = migrationPathway.value*/} 
                                return <li key={child.name}><NewMigrationPathwayButton migrationPathway={child} disabled={child.name != "fra forskning" && child.name != "til forskning" && child.name != "fra botaniske/zoologiske hager / akvarier (ikke privat)" && child.name != "til botaniske/zoologiske hager / akvarier (ikke privat)" && !vurdering.productionSpecies}  onSave={onSave} koder={koder} mainCodes={mainCodes} vurdering={vurdering} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/></li>
                            })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}


}

NewMigrationPathwayGroup.contextTypes = {
    readonly: PropTypes.bool
}
