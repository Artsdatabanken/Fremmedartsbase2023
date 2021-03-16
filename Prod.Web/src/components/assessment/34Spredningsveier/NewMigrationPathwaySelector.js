import React from 'react';
import {observer} from 'mobx-react';
import NewMigrationPathwaySection from './NewMigrationPathwaySection'

@observer
export default class NewMigrationPathwaySelector extends React.Component {
    render() {
        const {migrationPathways, onSave, koder, hideIntroductionSpread, labels} = this.props;
        //  console.log("koder2" + koder.toString() )
        return(
            <div>
                {migrationPathways.map(child =>
                    <div key={child.name}>
                        <NewMigrationPathwaySection migrationPathway={child} onSave={onSave} koder={koder} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/>
                    </div>
                )}
            </div>
        )}
}
