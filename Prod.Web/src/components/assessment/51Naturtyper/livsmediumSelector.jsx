import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import { action } from 'mobx';

class LivsmediumSelector extends React.Component {
    constructor(props) {
        super(props)
        const ass = props.assessment
        this.setSelectedNT = action ((naturtypekode) => {
            const nnt = props.nyNaturtype
            nnt.niNCode = naturtypekode.Id
            nnt.name = naturtypekode.Text
            nnt.timeHorizon = (ass.speciesStatus == "A" && ass.isDoorKnocker) ? "future" : null,
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
            nnt.affectedArea = null
            props.showModal()
        })
    }
    truncCode(kode) {
        return (kode.Id != undefined && kode.Id.length > 3 && kode.Id.startsWith("LI ")) 
            ? kode.Id.substring(3)
            : kode.Id
    }
    render() {
        const {naturtyper} = this.props;
        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                        > 
                            {hovedtypegruppe.Collapsed == true 
                            ? <span className="material-symbols-outlined">keyboard_arrow_right</span>
                            : <span className="material-symbols-outlined"> keyboard_arrow_down</span>}
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "70px"}}>{this.truncCode(hovedtypegruppe)}</span>
                                {/* to show the name for the highest level for those nature types that only have code*/}
                                {this.truncCode(hovedtypegruppe).length < 3 && <span>{hovedtypegruppe.Text}</span>}
                            </span>
                        </div>
                        {
                        !hovedtypegruppe.Collapsed && hovedtypegruppe.Children 
                        ? <div className="tree-view-children">
                            {hovedtypegruppe.Children.map(hovedtype =>
                            <div key={hovedtype.Id}>
                                <div
                                    className={"glyphicon glyphicon-chevron-down tree-view-arrow " + 
                                        (hovedtype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                    onClick={() => hovedtype.Collapsed = !hovedtype.Collapsed}>
                                    {hovedtype.Children.length > 0 
                                    ? hovedtype.Collapsed == true
                                        ? <span className="material-symbols-outlined">keyboard_arrow_right</span> 
                                        : <span className="material-symbols-outlined"> keyboard_arrow_down</span> 
                                    : <div style={{width: '24px'}}>
                                    </div>} {/* <-- to align all the choice buttons even though they don't have an arrow to expand */}
                                </div>
                                <div className="tree-view-label" onClick={() => this.setSelectedNT(hovedtype) }>
                                    <Xcomp.Button className="hovedtype btn-flat">
                                        <span className="naturtype-kode">{this.truncCode(hovedtype)}</span>
                                        <span>{hovedtype.Text}</span>
                                    </Xcomp.Button>
                                </div>
                                {!hovedtype.Collapsed && hovedtype.Children ?
                                <div className="tree-view-children">
                                {hovedtype.Children.map(grunntype =>
                                    <div key={grunntype.Id} onClick={() => this.setSelectedNT(grunntype)}>
                                        <span className="grunntype btn-flat">
                                            <span className="naturtype-kode">{this.truncCode(grunntype)}</span>
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

export default observer(LivsmediumSelector);
