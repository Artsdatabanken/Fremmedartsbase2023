// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';


@observer
export default class NaturtypeSelector extends React.Component {
    constructor(props) {
        super(props)
    }
    truncLI(kode) {
        return (kode && kode.length > 3 && kode.startsWith("LI ")) 
            ? kode.substring(3)
            : kode
    }
    render() {
        const {naturtyper, setSelected} = this.props;
        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtypegruppe.collapsed ? "tree-view-arrow-collapsed" : "")}
                            onClick={() => hovedtypegruppe.collapsed = !hovedtypegruppe.collapsed}>
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "30px"}}>{this.truncLI(hovedtypegruppe.id)}</span>
                                <span>{hovedtypegruppe.name}</span>
                            </span>
                        </div>
                        {!hovedtypegruppe.collapsed ?
                        <div className="tree-view-children">
                        {hovedtypegruppe.children.map(hovedtype =>
                            <div key={hovedtype.id}>
                                <div
                                    className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtype.collapsed ? "tree-view-arrow-collapsed" : "")}
                                    onClick={() => hovedtype.collapsed = !hovedtype.collapsed}>
                                    {/*▾*/}
                                </div>
                                <div className="tree-view-label" onClick={() => setSelected(hovedtype.id) }>
                                    <span className="hovedtype btn-flat">
                                        <span className="naturtype-kode">{this.truncLI(hovedtype.id)}</span>
                                        <span>{hovedtype.name}</span>
                                    </span>
                                </div>
                                {!hovedtype.collapsed ?
                                <div className="tree-view-children">
                                {hovedtype.children.map(grunntype =>
                                    <div key={grunntype.id} onClick={() => setSelected(grunntype.id)}>
                                        <span className="grunntype btn-flat">
                                            <span className="naturtype-kode">{this.truncLI(grunntype.id)}</span>
                                            <span>{grunntype.name}</span>
                                        </span>
                                    </div>
                                )}
                                </div> :
                                null }
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
