import React from 'react';
import {extendObservable, observable, action} from 'mobx';
import {observer} from 'mobx-react';

import createTaxonSearch from '../../createTaxonSearch'
import HabitatTableRow from './habitatTableRow';


class HabitatTable extends React.Component {
    constructor(props) {
        super()
        
        extendObservable(this, {
            taxon: {
                id: "habitatTableTaxonSearch",
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
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                effect : "Weak",
                scale: "Limited",
                status: "NewAlien",
                interactionType : "CompetitionSpace", 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
        })
        createTaxonSearch(this.taxon, props.appState.assessment.evaluationContext)
    }
            
    @observable editMode = false

    @action toggleEdit = () => {
        this.editMode = !this.editMode
    }
    render() {
        const {naturetypes, labels, canRenderTable, appState, desc} = this.props;
        const ntLabels = labels.NatureTypes
        const assessment = appState.assessment
        // console.log("naturtyperader#: " + naturetypes.length)
        return(
            <div>
                <p>{desc}</p>
                <table className="table habitat">
                    <colgroup>               
                        <col  style={{width: "15%"}}/>
                        <col  style={{width: "30%"}}/>
                        <col  style={{width: "15%"}}/>
                        <col  style={{width: "25%"}}/>
                        <col  style={{width: "15%"}}/>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>{ntLabels.code}</th>
                            <th>{ntLabels.habitat}</th>
                            <th>{ntLabels.hosts}</th>
                            <th>{ntLabels.timeHorizon}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {canRenderTable 
                        ? naturetypes.map(nt => { 
                            const deleteRow = () => naturetypes.remove(nt)
                            const key = nt.niNCode + nt.timeHorizon + nt.colonizedArea + nt.affectedArea
                            return <HabitatTableRow 
                                key={key} 
                                naturtype={nt} 
                                taxon={this.taxon} 
                                deleteRow={deleteRow} 
                                appState={appState} 
                                toggleEdit={this.toggleEdit} 
                                editMode={this.editMode} 
                                labels={labels} 
                                assessment={assessment}/> }) 
                        : null}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default observer(HabitatTable);