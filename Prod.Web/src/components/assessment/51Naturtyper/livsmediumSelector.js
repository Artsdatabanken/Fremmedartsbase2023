// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as Xcomp from './../observableComponents';
import { action } from 'mobx';


@observer
export default class LivsmediumSelector extends React.Component {
    constructor(props) {
        console.log("nts: " + JSON.stringify(props.naturtyper, undefined))
        super(props)
        this.setSelectedNT = action ((naturtypekode) => {
            console.log("Livsmedium kode: " + naturtypekode.Id)
            const nnt = props.nyNaturtype
            nnt.niNCode = naturtypekode.Id
            nnt.name = naturtypekode.Text
            nnt.timeHorizon = null
            nnt.colonizedArea = null
            nnt.taxon = {
                id: "newHabitatTaxon",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                basisOfAssessment: []
            }
            // nnt.stateChange.clear()
            nnt.affectedArea = null
            // nnt.background.clear()
            props.showModal()
        })
    }
    truncCode(kode) {
        console.log("trunc: '" + kode.Id + "'")
        return (kode.Id != undefined && kode.Id.length > 3 && kode.Id.startsWith("LI ")) 
            ? kode.Id.substring(3)
            : kode.Id
    }


    
    render() {
        const {naturtyper} = this.props;

        // console.log("SELECTOR: " + JSON.stringify(naturtyper, undefined, 2))

        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        <div
                        className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            //className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtypegruppe.Collapsed ? "tree-view-arrow-collapsed" : "")}
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "70px"}}>{this.truncCode(hovedtypegruppe)}</span>
                                {/* to show the name for the highest level for those nature types that only have code*/}
                                {this.truncCode(hovedtypegruppe).length < 3 && <span>{hovedtypegruppe.Text}</span>}
                                {/* {config.showdescription(this.truncCode(hovedtypegruppe.Value)) && <span>{hovedtypegruppe.Text}</span>} */}
                               {/* <span>{hovedtypegruppe.Id}</span> */}
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children ?
                        //hovedtypegruppe.Children ?
                        <div className="tree-view-children">
                        {hovedtypegruppe.Children.map(hovedtype =>
                            <div key={hovedtype.Id}>
                                <div
                                    className={"glyphicon glyphicon-chevron-down tree-view-arrow " + 
                                        (hovedtype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                    onClick={() => hovedtype.Collapsed = !hovedtype.Collapsed}>
                                    {hovedtype.Children.length > 0 ? hovedtype.Collapsed == false? <ExpandMoreIcon/> : <NavigateNextIcon/> : <div style={{width: '24px'}}></div>} {/* <-- to align all the choice buttons even though they don't have an arrow to expand */}
                                </div>
                                <div className="tree-view-label" onClick={() => this.setSelectedNT(hovedtype) }>
                                    <Xcomp.Button className="hovedtype btn-flat">
                                        <span className="naturtype-kode">{this.truncCode(hovedtype)}</span>
                                        {/* <span>{hovedtype.name}</span> */}
                                        <span>{hovedtype.Text}</span>
                                    </Xcomp.Button>
                                </div>
                                {!hovedtype.Collapsed && hovedtype.Children ?
                                <div className="tree-view-children">
                                {hovedtype.Children.map(grunntype =>
                                    <div key={grunntype.Id} onClick={() => this.setSelectedNT(grunntype)}>
                                        <span className="grunntype btn-flat">
                                            <span className="naturtype-kode">{this.truncCode(grunntype)}</span>
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
                        null }
                    </div>
                )}
            </div> 
        );
    }
}
