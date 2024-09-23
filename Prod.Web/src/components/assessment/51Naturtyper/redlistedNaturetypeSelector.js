// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';

class RedlistedNaturtypeSelector extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {naturtyper, setSelected} = this.props;
        return(
            <div>
                {naturtyper.map(gruppe => 
                    <div key={gruppe.Id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (gruppe.collapsed ? "tree-view-arrow-collapsed" : "")}
                            onClick={action (() => gruppe.collapsed = !gruppe.collapsed)}>
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">{gruppe.Id}</span>
                        </div>
                        {!gruppe.collapsed ?
                        <div className="tree-view-children">
                        {gruppe.children.map(rlnt =>
                            <div key={rlnt.Id} onClick={() => setSelected(rlnt)}>
                                <span className="grunntype btn-flat"> 
                                    <b>{ rlnt.name}</b>
                                    &nbsp;
                                    {rlnt.NiN1TypeCode 
                                    ? <span>{
                                        
                                        " '" + rlnt.NiN1TypeCode + (rlnt.KTVNin1 ? " + " + rlnt.KTVNin1 : "" ) + "' "  
                                    } </span>
                                    : null}
                                    &nbsp;
                                    {rlnt.category
                                    ? <b>{rlnt.category}</b>
                                    : null}
                                </span>
                            </div>
                        )}
                        </div> :
                        null }
                    </div>
                )}
            </div> 
        );
    }
}

export default observer(RedlistedNaturtypeSelector);
