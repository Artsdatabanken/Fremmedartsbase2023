import React from 'react';
import {observer} from 'mobx-react';
import NewMigrationPathwaySection from './NewMigrationPathwaySection'

@observer
export default class NewMigrationPathwaySelector extends React.Component {
    render() {
        const {migrationPathways, onSave, koder, hideIntroductionSpread, labels, vurdering, mainCodes} = this.props;
        //  console.log("koder2" + koder.toString() )
        console.log(migrationPathways)
        return(
            <div>
                {migrationPathways.map(child =>
                    <div key={child.name}>
                        <NewMigrationPathwaySection migrationPathway={child} onSave={onSave} koder={koder} mainCodes={mainCodes} vurdering={vurdering} hideIntroductionSpread={hideIntroductionSpread} labels={labels}/>
                    </div>
                )}
            </div>
        )}
}
