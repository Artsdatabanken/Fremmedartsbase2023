import React from 'react';
import { observer } from 'mobx-react';
import NewMigrationPathwayGroup from './NewMigrationPathwayGroup'

class NewMigrationPathwaySection extends React.Component {
    render() {
        const { migrationPathway, onSave, koder, hideIntroductionSpread, labels, vurdering, mainCodes } = this.props;
        return (
            <div>
                {migrationPathway.children.map(child =>
                    <NewMigrationPathwayGroup key={child.name} migrationPathway={child} onSave={onSave} koder={koder} vurdering={vurdering} mainCodes={mainCodes} hideIntroductionSpread={hideIntroductionSpread} labels={labels} />
                )}
            </div>
        )
    }
}

export default observer(NewMigrationPathwaySection);
