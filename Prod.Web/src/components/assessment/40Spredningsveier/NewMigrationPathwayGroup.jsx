import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { action, computed, extendObservable, observable, makeObservable } from 'mobx';
import NewMigrationPathwayButton from './NewMigrationPathwayButton'

class NewMigrationPathwayGroup extends React.Component {
    constructor(props) {
        super(props);

        makeObservable(this, {
            expanded: observable
        });

        extendObservable(this, {
            expandPathways: false,
        })

        this.togglePathways = () => {
            action(() => {
                this.expandPathways = !this.expandPathways
            })()
        }
    }

    expanded = false;
    expand() {
        console.log(JSON.stringify(this.context))
        if(this.context.readonly) return
        this.expanded = !this.expanded
    }
    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, labels, vurdering, mainCodes} = this.props;
        const hasChildren = migrationPathway.children && migrationPathway.children.length > 0 
        const disabled = (migrationPathway.name == "Rømning/forvilling" && vurdering.indoorProduktion === "positive")
        return(
            <div style={{maxWidth: "600px"}}>
                <div className="panel panel-default compact">
                    <div className="panel-heading compact migration" onClick={migrationPathway.value === null ? ()=> this.expand() : null}>
                        <Xcomp.Button disabled={disabled} onClick={()=> {this.togglePathways()}}>{migrationPathway.name} 
                        {hasChildren ? 
                        <div style={{float: "right"}} onClick={ (e)=> {e.stopPropagation(); this.expand(); this.togglePathways()}}>
                            <ExpandMoreIcon></ExpandMoreIcon>
                            </div> : null}</Xcomp.Button>             
                    </div>
                    <div className={"panel-collapse" + (!this.expandPathways ? " collapse" : this.expanded ? " in" : "")}
                     aria-hidden="false"
                     >
                        <div className="panel-body">
                            <ul className="migration">
                            {migrationPathway.children.map(child => {
                                return <li 
                                    key={child.name}><NewMigrationPathwayButton 
                                    migrationPathway={child} 
                                    mainCat={migrationPathway.name} 
                                    disabled={
                                        (migrationPathway.name == "Direkte import" || migrationPathway.name == "Rømning/forvilling") 
                                        && vurdering.productionSpecies != true
                                    }  
                                    onSave={onSave} 
                                    koder={koder} 
                                    mainCodes={mainCodes} 
                                    vurdering={vurdering} 
                                    hideIntroductionSpread={hideIntroductionSpread} 
                                    labels={labels}/></li>
                            })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}


}

export default observer(NewMigrationPathwayGroup);

NewMigrationPathwayGroup.contextTypes = {
    readonly: PropTypes.bool
}
