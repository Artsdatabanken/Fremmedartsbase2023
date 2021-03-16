import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import {action, extendObservable, observable} from 'mobx';
import * as Xcomp from '../observableComponents';

import {processTree} from '../../../utils'
//const labels = config.labels



@observer
export default class MigrationPathwayTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {migrationPathways, fabModel, removeMigrationPathway, showIntroductionSpread} = this.props;
        const labels = fabModel.kodeLabels
        const nbsp = "\u00a0"
        return(
            <table className="table">
                <thead>
                <tr>
                    <th>{labels.MigrationPathway.category}</th>
                    {/*<th>{labels.migrationPathway.CodeItem}</th>*/}
                    {showIntroductionSpread ? <th>{labels.MigrationPathway.introductionSpread}</th> : null}
                    <th>{labels.MigrationPathway.influenceFactor}</th>
                    <th>{labels.MigrationPathway.magnitude}</th>
                    <th>{labels.MigrationPathway.timeOfIncident}</th>
                    <th>{labels.MigrationPathway.elaborateInformation}</th>
                    <th>{nbsp}</th>
                    <th>{nbsp}</th>
                </tr>
                </thead>
                <tbody>
                {migrationPathways.map(mp => 
                    <MigrationPathwayTableRow 
                        item={mp} 
                        key={mp.Category+mp.CodeItem+mp.IntroductionSpread+mp.InfluenceFactor+mp.Magnitude+mp.TimeOfIncident}
                        codes={fabModel.koder}
                        migrationPathways={fabModel.spredningsveier}
                        showIntroductionSpread={showIntroductionSpread}
                        removeMigrationPathway={removeMigrationPathway}
                        labels={labels}
                    />
                )}
                </tbody>                
            </table>
        );
    }
}

MigrationPathwayTable.contextTypes = {
    readonly: React.PropTypes.bool
}



@observer
class MigrationPathwayTableRow extends React.Component {
    constructor(props) {
        super(props);
        extendObservable(this, {
            edit: false,
            open: false
        })
    }

    findSV(mpk, value) {
        const iterable = processTree(mpk)
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

    render() {
        const {item, codes, migrationPathways, showIntroductionSpread, removeMigrationPathway, labels } = this.props;
        const mp = item
        const introductionSpreadLabel = (id) => codes.migrationPathwayIntroductionSpread.find(code => code.Value === id).Text
        const frequencyLabel = (id) => codes.migrationPathwayFrequency.find(code => code.Value === id).Text
        const abundaceLabel = (id) => codes.migrationPathwayAbundance.find(code => code.Value === id).Text
        const timeOfIncidentLabel = (id) => codes.migrationPathwayTime.find(code => code.Value === id).Text
        const codeItemLabel = (id) => this.findSV(migrationPathways, id).name


        const eloborateText = item.ElaborateInformation
        const elobTxt = this.open ? eloborateText : this.trunc(eloborateText)
        return(
            <tr >
                <td>{codeItemLabel(mp.CodeItem)}</td>
                {showIntroductionSpread ? <td>{introductionSpreadLabel(mp.IntroductionSpread)}</td> : null}
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'InfluenceFactor']}  codes={codes.migrationPathwayFrequency}/></td>
                : <td>{frequencyLabel(mp.InfluenceFactor)}</td>
                }
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'Magnitude']}  codes={codes.migrationPathwayAbundance}/></td>
                : <td>{abundaceLabel(mp.Magnitude)}</td>
                }
                {this.edit
                ? <td><Xcomp.StringEnum observableValue={[mp, 'TimeOfIncident']}  codes={codes.migrationPathwayTime}/></td>
                : <td>{timeOfIncidentLabel(mp.TimeOfIncident)}</td>
                }
                {this.edit
                ? <td><Xcomp.HtmlString observableValue={[mp, 'ElaborateInformation']} /></td>
                : <td dangerouslySetInnerHTML={{__html: elobTxt}} onClick={() => this.open = !this.open} />
                }
                <td><Xcomp.Button disabled={this.context.readonly} xs onClick={() => this.edit = !this.edit}>{this.edit ? labels.General.ok : labels.General.edit}</Xcomp.Button></td>
                <td><Xcomp.Button disabled={this.context.readonly} xs onClick={() => removeMigrationPathway(mp)}>{labels.General.remove}</Xcomp.Button></td>
            </tr>
            
        )
    }
}


                    // <Xcomp.StringEnum label={labels.migrationPathway.InfluenceFactor} observableValue={[this.newMigrationPathway, 'InfluenceFactor']} forceSync codes={koder.migrationPathwayFrequency}/>
                    // <Xcomp.StringEnum label={labels.migrationPathway.Magnitude} observableValue={[this.newMigrationPathway, 'Magnitude']} forceSync codes={koder.migrationPathwayAbundance}/>
                    // <Xcomp.StringEnum label={labels.migrationPathway.TimeOfIncident} observableValue={[this.newMigrationPathway, 'TimeOfIncident']} forceSync codes={koder.migrationPathwayTime}/>
