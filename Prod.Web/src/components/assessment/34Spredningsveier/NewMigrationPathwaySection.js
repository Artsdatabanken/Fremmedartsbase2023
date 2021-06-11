import React from 'react';
import {observer} from 'mobx-react';
import NewMigrationPathwayGroup from './NewMigrationPathwayGroup'

@observer
export default class NewMigrationPathwaySection extends React.Component {
    render() {
        const {migrationPathway, onSave, koder, hideIntroductionSpread, labels, mainCodes} = this.props;
        
        
        return(
            <div>
                {/*<h4>{migrationPathway.name}</h4>*/}
                {migrationPathway.children.map(child =>
                    <NewMigrationPathwayGroup  key={child.name} migrationPathway={child} onSave={onSave} koder={koder} mainCodes={mainCodes} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/>
                )}
            </div>
        )}
}
