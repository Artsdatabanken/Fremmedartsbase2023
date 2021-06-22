// import config from '../../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {action, computed, extendObservable, observable} from 'mobx';
// import * as Xcomp from '../observableComponents';
// import BsModal from '../bootstrapModal'
// const labels = config.labels

import NewMigrationPathwayButton from './NewMigrationPathwayButton'


@observer
export default class NewMigrationPathwayGroup extends React.Component {
    @observable expanded = false;
    
    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, labels, mainCodes} = this.props;
        //  console.log("koder3" + koder.toString() )

        const hasChildren = migrationPathway.children && migrationPathway.children.length > 0 
            // <div className="clearfix col-lg-4 col-md-6 col-sm-8 col-xs-12">
        //todo: fix data for "egenspredning". remove the invalid child
        return(
            <div style={{maxWidth: "600px"}}>
                <div className="panel panel-default compact">
                    <div className="panel-heading compact" onClick={migrationPathway.value === null ? ()=> this.expand() : null}>
                        {hasChildren ? <div style={{float: "right"}} onClick={ (e)=> {e.stopPropagation(); this.expand()}}><span className={"glyphicon glyphicon-chevron-" + (this.expanded ? "up" : "down")}></span></div> : null}
                        {migrationPathway.value === null ?
                        <div>{migrationPathway.name}</div> :              
                        <NewMigrationPathwayButton migrationPathway={migrationPathway} onSave={onSave} koder={koder} mainCodes={mainCodes} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/>}
                    </div>
                    <div className={"panel-collapse collapse" + (this.expanded ? " in" : "")} aria-hidden="false">
                        <div className="panel-body">
                            <ul className="list-unstyled">
                            {migrationPathway.children.map(child => {
                                {/*child.parentValue = migrationPathway.value*/} 
                                return <li  key={child.name}><NewMigrationPathwayButton migrationPathway={child} onSave={onSave} koder={koder} mainCodes={mainCodes} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/></li>
                            })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

    expand() {
        console.log(JSON.stringify(this.context))
        if(this.context.readonly) return
        this.expanded = !this.expanded
    }
}

NewMigrationPathwayGroup.contextTypes = {
    readonly: PropTypes.bool
}
