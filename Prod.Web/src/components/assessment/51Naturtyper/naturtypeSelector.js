// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


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
                        className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            //className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtypegruppe.Collapsed ? "tree-view-arrow-collapsed" : "")}
                            onClick={() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "30px"}}>{this.truncLI(hovedtypegruppe.id)}</span>
                                <span>{hovedtypegruppe.name}</span>
                                <span>{hovedtypegruppe.Text}</span>
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children ?
                        //hovedtypegruppe.Children ?
                        <div className="tree-view-children">
                        {hovedtypegruppe.Children.map(hovedtype =>
                            <div key={hovedtype.id}>
                                <div
                                    className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                    onClick={() => hovedtype.Collapsed = !hovedtype.Collapsed}>
                                    {/*▾*/}
                                </div>
                                <div className="tree-view-label" onClick={() => setSelected(hovedtype.id) }>
                                    <span className="hovedtype btn-flat">
                                        <span className="naturtype-kode">{this.truncLI(hovedtype.id)}</span>
                                        <span>{hovedtype.name}</span>
                                        <span>{hovedtype.Text}</span>
                                    </span>
                                </div>
                                {!hovedtype.Collapsed && hovedtype.Children ?
                                <div className="tree-view-children">
                                {hovedtype.Children.map(grunntype =>
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
