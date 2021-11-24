import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as Xcomp from './../observableComponents';
import { action } from 'mobx';

@observer
export default class NaturtypeSelector extends React.Component {
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
        const {naturtyper} = this.props;

        // console.log("SELECTOR: " + JSON.stringify(naturtyper, undefined, 2))

        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        {/* <div
                        className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            //className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtypegruppe.Collapsed ? "tree-view-arrow-collapsed" : "")}
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div> */}
                        <div className="tree-view-label btn-flat"  onClick={() => this.setSelectedNT(hovedtypegruppe.Id)}>
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "300px"}}>{hovedtypegruppe.Value}</span>
                                {<span>{hovedtypegruppe.Text}</span>}
                            </span>
                        </div>
                    </div>
                )}
            </div> 
        );
    }
}
