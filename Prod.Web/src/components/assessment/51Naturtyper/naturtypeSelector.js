// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as Xcomp from './../observableComponents';
import { action } from 'mobx';


@observer
export default class NaturetypeSelector extends React.Component {
    constructor(props) {
        console.log("nts: " + JSON.stringify(props.naturtyper, undefined))
        super(props)
        this.setSelectedNT = action ((naturtypekode) => {
            console.log("Truet kode: " + naturtypekode)
            const nnt = props.nyNaturtype
            nnt.niNCode = naturtypekode
            nnt.timeHorizon = null
            nnt.colonizedArea = null
            // nnt.stateChange.clear()
            nnt.affectedArea = null
            // nnt.background.clear()
            props.showModal()
        })

    }
    render() {
        const {naturtyper, setSelected} = this.props;
        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "300px"}}>{hovedtypegruppe.Text}</span>
                                {/* <span>{hovedtypegruppe.Value}</span>} */}
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children ?
                        <div className="tree-view-children">
                            {hovedtypegruppe.Children.map(hovedtype =>
                            <div key={hovedtype.Id}>
                                <div
                                    className={"glyphicon glyphicon-chevron-down tree-view-arrow " + 
                                        (hovedtype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                    onClick={() => hovedtype.Collapsed = !hovedtype.Collapsed}>
                                    {hovedtype.Children.length > 0 ? hovedtype.Collapsed == false? <ExpandMoreIcon/> : <NavigateNextIcon/> : <div style={{width: '24px'}}></div>} {/* <-- to align all the choice buttons even though they don't have an arrow to expand */}
                                </div>
                                <div className="hovedtype tree-view-label btn-flat"  onClick={() => this.setSelectedNT(hovedtype.Id)}>
                                    <span className="naturtype-kode">{hovedtype.Text}</span>
                                    <span className="nt-code">{"'"+hovedtype.Value+"'"}</span>
                                </div>
                                {!hovedtype.Collapsed && hovedtype.Children ?
                                <div className="tree-view-children">
                                {hovedtype.Children.map(grunntype =>
                                    <div key={grunntype.Id} onClick={() => this.setSelectedNT(grunntype.Id)}>
                                        <span className="grunntype btn-flat">
                                            <span className="naturtype-kode">{grunntype.Id}</span>
                                            {/* <span>{grunntype.name}</span> */}
                                            <span>{grunntype.Text}</span>
                                        </span>
                                    </div>
                                )}
                                </div> :
                                null }




                            </div>
                            )}
                        </div> :
                        null 
                        }
                    </div>
                )}
            </div> 
        );
    }
}
