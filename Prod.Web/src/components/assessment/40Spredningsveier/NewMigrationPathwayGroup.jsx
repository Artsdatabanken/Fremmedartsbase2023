import React, { useState } from 'react';
import { observer } from 'mobx-react';
import * as Xcomp from '../observableComponents';
import { action } from 'mobx';
import NewMigrationPathwayButton from './NewMigrationPathwayButton'

const NewMigrationPathwayGroup = (props) => {
    const { migrationPathway, onSave, koder, hideIntroductionSpread, labels, vurdering, mainCodes, context } = props;
    const hasChildren = migrationPathway.children && migrationPathway.children.length > 0;
    const disabled = (migrationPathway.name == "Rømning/forvilling" && vurdering.indoorProduktion === "positive");

    const [expanded, setExpanded] = useState(false);
    const [expandPathways, setExpandPathways] = useState(false);

    const togglePathways = () => {
        action(() => {
            setExpandPathways(!expandPathways);
        })()
    }

    const expand = () => {
        if (context.readonly) return;
        setExpanded(!expanded);
    }


    return (
        <div style={{ maxWidth: "600px" }}>
            <div className="panel panel-default compact">
                <div className="panel-heading compact migration" onClick={migrationPathway.value === null ? () => expand() : null}>
                    <Xcomp.Button disabled={disabled} onClick={() => { togglePathways() }}>{migrationPathway.name}
                        {hasChildren ?
                            <div style={{ float: "right" }} onClick={(e) => { e.stopPropagation(); expand(); togglePathways() }}>
                                {expandPathways ?
                                    <span className="material-symbols-outlined">keyboard_arrow_right</span> :
                                    <span className="material-symbols-outlined"> keyboard_arrow_down</span>
                                }
                            </div> : null}
                    </Xcomp.Button>
                </div>
                <div className={"panel-collapse" + (!expandPathways ? " collapse" : expanded ? " in" : "")}
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
                                        labels={labels} /></li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(NewMigrationPathwayGroup);

