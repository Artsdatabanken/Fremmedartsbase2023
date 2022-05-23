import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, extendObservable, observable} from 'mobx';
import * as Xcomp from '../../observableComponents';
import {processTree} from '../../../utils'
@inject("appState")
@observer
export default class MigrationPathwayTable extends React.Component {
    constructor(props) {
        super(props);
    }
    @observable editMode = false
    @action toggleEdit = () => {
        this.editMode = !this.editMode
    }
    render() {
        const {migrationPathways, appState, removeMigrationPathway, showIntroductionSpread, hideIntroductionSpread, getCategoryText, migrationPathwayCodes} = this.props;
        const labels = appState.codeLabels
        const koder = appState.koder
        const spredningsveier = koder.migrationPathways[0]
        const nbsp = "\u00a0"
        return(
            <table className="table migrationPathways">
                <thead>
                <tr>
                    <th>{labels.MigrationPathway.mainCategory}</th>
                    <th>{labels.MigrationPathway.category}</th>
                    <th>{labels.MigrationPathway.influenceFactor}</th>
                    <th>{labels.MigrationPathway.magnitude}</th>
                    <th>{labels.MigrationPathway.timeOfIncident}</th>
                    <th>{nbsp}</th>
                    <th>{nbsp}</th>
                    <th>{nbsp}</th>
                </tr>
                </thead>
                <tbody>
                {migrationPathways.map(mp => 
                    
                    <MigrationPathwayTableRow 
                        item={mp} 
                        key={mp.category+mp.codeItem+mp.introductionSpread+mp.influenceFactor+mp.magnitude+mp.timeOfIncident}
                        codes={koder}
                        migrationPathways={spredningsveier}
                        showIntroductionSpread={showIntroductionSpread}
                        removeMigrationPathway={removeMigrationPathway}
                        labels={labels}
                        editMode={this.editMode}
                        getCategoryText = {getCategoryText}
                        toggleEdit={this.toggleEdit}
                        migrationPathwayCodes = {migrationPathwayCodes}
                    />
                )}
                </tbody>                
            </table>
        );
    }
}
MigrationPathwayTable.contextTypes = {
    readonly: PropTypes.bool
}
@observer
class MigrationPathwayTableRow extends React.Component {
    constructor(props) {
        super(props);
        extendObservable(this, {
            edit: props.editMode,
            open: false
        })
    }
    findSV(mpk, value) {
        const iterable = processTree(mpk)
        // console.log("___mpk: " + JSON.stringify(mpk))
        // console.log("___value: " + JSON.stringify(value))
        // console.log("___iterable: " + JSON.stringify(iterable))

        for (let item of iterable) {
            if (item.value === value) 
                return item
        }
        return undefined
    }
    trunc(s, n){
        n = n === undefined ? 15 : n
        return s.substr(0, n-1) + (s.length > n ? '&hellip;' : '')
    }
    getCategoryPart (s, level) {
        s = s.split("-")
        var result = null

        s != null && s.length > 1 ? level == 1 ? result = s[0] : result = s[1].substr(1, s[1].length-3) : null
        return result
    }
    render() {
        const {appState, item, codes, migrationPathways, removeMigrationPathway, labels, getCategoryText, migrationPathwayCodes, editMode, toggleEdit } = this.props;
        const mp = item
        // console.log("___: " + JSON.stringify(codes.migrationPathwayIntroductionSpread))
        const frequencyLabel = (id) => codes.migrationPathwayFrequency.find(code => code.Value === id).Text
        const abundaceLabel = (id) => codes.migrationPathwayAbundance.find(code => code.Value === id).Text
        const timeOfIncidentLabel = (id) => codes.migrationPathwayTime.find(code => code.Value === id).Text
        return(
            <tr>
                <td>{mp.mainCategory ? mp.mainCategory : this.getCategoryPart(getCategoryText(mp.codeItem, migrationPathwayCodes), 1)}</td>
                <td>{mp.category ? mp.category : this.getCategoryPart(getCategoryText(mp.codeItem, migrationPathwayCodes), 2)}</td>
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'influenceFactor']}  codes={codes.migrationPathwayFrequency}/></td>
                : <td>{frequencyLabel(mp.influenceFactor)}</td>
                }
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'magnitude']}  codes={codes.migrationPathwayAbundance}/></td>
                : <td>{abundaceLabel(mp.magnitude)}</td>
                }
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'timeOfIncident']}  codes={codes.migrationPathwayTime}/></td>
                : <td>{timeOfIncidentLabel(mp.timeOfIncident)}</td>
                }
                <td></td>
                <td><Xcomp.Button disabled={this.context.readonly} xs title={!this.edit ? labels.General.edit : labels.General.ok} onClick={action(() => {this.edit = !this.edit; toggleEdit()})}>{this.edit ? labels.General.ok : 
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                        
                        }</Xcomp.Button>
                    <Xcomp.Button disabled={this.context.readonly} xs title={labels.General.remove} onClick={() => removeMigrationPathway(mp)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                        </Xcomp.Button></td>
                <td></td>
            </tr>
        )
    }
}
