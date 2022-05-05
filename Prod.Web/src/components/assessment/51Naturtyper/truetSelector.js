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
        const ass = props.assessment
        this.setSelectedNT = action ((naturtypekode) => {
            console.log("Truet kode: " + naturtypekode.Id)
            const nnt = props.nyNaturtype
            //nnt.niNCode = naturtypekode.Id
            // set the code as null because the codes are too long (see Eveliina's comment in issue #250)
            nnt.niNCode = naturtypekode.Id
            nnt.name = naturtypekode.Text
            nnt.timeHorizon = (ass.isDoorKnocker && ass.speciesStatus == "A") ? "future" : null,
            nnt.colonizedArea = null
            nnt.stateChange.clear()
            nnt.affectedArea = null
            nnt.background.clear()
            props.showModal()
        })

    }
    render() {
        const {naturtyper, setSelected} = this.props;

        // console.log("SELECTOR: " + JSON.stringify(naturtyper, undefined, 2))

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
                                <span className="naturtype-kode" style={{width: "300px"}}>{hovedtypegruppe.Value}</span>
                                {/* <span>{hovedtypegruppe.Text}</span>} */}
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children ?
                        <div className="tree-view-children">
                            {hovedtypegruppe.Children.map(hovedtype =>

                            <div key={hovedtype.Id} className="tree-view-label btn-flat" onClick={() => this.setSelectedNT(hovedtype)}>
                                <div className="hovedtypegruppe">
                                    <span className="naturtype-kode">{hovedtype.Text + " ("+hovedtype.Category.substring(0,2)+")"}</span>
                                    {/*<span className="nt-code">{"'"+hovedtype.Value+"'"}</span>
                                    <span className="nt-category"></span>*/}
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
