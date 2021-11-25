// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as Xcomp from './../observableComponents';
import { action } from 'mobx';


@observer
export default class TruetSelector extends React.Component {
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

        // console.log("SELECTOR: " + JSON.stringify(naturtyper, undefined, 2))

        return(
            <div>
                <span>Her kan du </span><a href="https://www.artsdatabanken.no/rodlistefornaturtyper" target="_blank">lese mer om naturtyper</a>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "300px"}}>{hovedtypegruppe.Value}</span>
                                {/* <span>{hovedtypegruppe.Text}</span>} */}
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children ?
                        <div className="tree-view-children">
                            {hovedtypegruppe.Children.map(hovedtype =>

                            <div key={hovedtype.Id} className="tree-view-label btn-flat" onClick={() => this.setSelectedNT(hovedtype.Id)}>
                                <div className="hovedtypegruppe">
                                    <span className="naturtype-kode">{hovedtype.Text}</span>
                                    {/*<span className="nt-code">{"'"+hovedtype.Value+"'"}</span>*/}
                                    <span className="nt-category">{hovedtype.Category.substring(0,3)}</span>
                                </div>
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