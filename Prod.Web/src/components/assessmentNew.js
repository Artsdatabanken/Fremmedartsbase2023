import React from 'react';
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
// import LoadingHoc from './LoadingHoc'
import {action, autorun, extendObservable, observable, toJS} from "mobx"
import createTaxonSearch from './createTaxonSearch'



const  newAssessment = observable({
    ScientificName: "",
    ScientificNameId: "",
    ScientificNameAuthor: "",
    VernacularName: "",
    TaxonRank: "",
    TaxonId: "",
    RedListCategory: "", 
    Ekspertgruppe: "",
    taxonSearchString: "",
    taxonSearchResult: []
    // taxonSearchWaitingForResult: false - should not be observable
})

@inject("appState")

@observer
export default class assessmentNew extends React.Component {
    constructor(props) {
        super(props)
        const {evaluationContext} = props
        this.onNewAssessment = () => {
            const newItem = newAssessment;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            clone.taxonSearchWaitingForResult = undefined

            action(() => {
                // reset newItem
                newItem.ScientificName = ""
                newItem.ScientificNameId = ""
                newItem.ScientificNameAuthor = ""
                newItem.VernacularName = ""
                newItem.TaxonRank = ""
                newItem.TaxonId = ""
                newItem.RedListCategory = "" 
                // newItem.Ekspertgruppe = props.ekspertgruppe
                newItem.taxonSearchString = ""
                newItem.taxonSearchResult.replace([])
                newItem.taxonSearchWaitingForResult = false
            })()
            props.onNewAssessment(clone)
        }
        autorun(() => 
            newAssessment.ekspertgruppe = this.props.appState.expertgroup
        )


        autorun(() => 
            console.log("api sciname : "  +            newAssessment.ScientificName)
           
        )



        createTaxonSearch(newAssessment, evaluationContext)
    }

    @action onSetEkspertgruppe(e) {
        this.props.appState.ekspertgruppe = e.target.value
    }

    render(props) {
        if (window.appInsights) {
            window.appInsights.trackPageView({name: 'NewAssessment'});
        }
        const {appState, checkForExistingAssessment} = this.props
        const labels = appState.codeLabels
        const codes = appState.koder
        const rolle = appState.roleincurrentgroup
        return (
            <div>
                <fieldset className="well">
                    <div className="row">
                        <div className="col-md-6">
                            <h3>{labels.SelectAssessment.createAssessment}</h3>
                            <br></br>
                            <h4>{labels.SelectAssessment.expertgroup}</h4>
                            <Xcomp.StringEnum
                                    observableValue={[appState, 'expertgroup']}
                                    codes={appState.expertgroups} />
                        </div>
                    </div>
                    <div className="row" style={{marginTop: '30px' }}>
                        <div className="col-md-6">
                            <div style={{position: 'relative'}}>
                                {newAssessment.ScientificName.length > 0 ?
                                <div 
                                    className="speciesNewItem"
                                    onClick={action(() => {
                                        newAssessment.TaxonId = "";
                                        newAssessment.TaxonRank = "";
                                        newAssessment.ScientificName = "";
                                        newAssessment.ScientificNameId = "";
                                        newAssessment.ScientificNameAuthor = "";
                                        newAssessment.VernacularName = "";
                                        newAssessment.RedListCategory = "";
                                        newAssessment.taxonSearchResult.replace([]); 
                                        newAssessment.taxonSearchString = "" }) 
                                    }
                                >
                                    <div className={"rlCategory " + newAssessment.RedListCategory}>{newAssessment.RedListCategory}</div>
                                    <div className="vernacularName">{newAssessment.VernacularName}</div>
                                    <div className="scientificName">{newAssessment.ScientificName}</div>
                                    <div className="author">{newAssessment.ScientificNameAuthor && newAssessment.ScientificNameAuthor.startsWith('(') ? newAssessment.ScientificNameAuthor : '(' + newAssessment.ScientificNameAuthor + ')'}</div>
                                </div> :
                                <Xcomp.String observableValue={[newAssessment, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />}
                                {newAssessment.taxonSearchResult.length > 0 ?
                                <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"-10px", backgroundColor: "#fcfcfc" }}>
                                    <ul className="panel list-unstyled">
                                    {newAssessment.taxonSearchResult.map(item =>
                                        <li onClick={action(e => {
                                            console.log(JSON.stringify(item))

                                            newAssessment.TaxonId = item.taxonId;
                                            newAssessment.TaxonRank = item.taxonRank;
                                            newAssessment.ScientificName = item.scientificName;
                                            newAssessment.ScientificNameId = item.scientificNameId;
                                            newAssessment.ScientificNameAuthor = item.author;
                                            newAssessment.VernacularName = item.popularName;

                                            newAssessment.RedListCategory = item.rlCategory;
                                            newAssessment.taxonSearchResult.replace([]); 
                                            newAssessment.taxonSearchString = "" })} 
                                            key={item.scientificName}
                                        >
                                            <div className="speciesSearchItem">
                                                <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                                {item.popularName ? <span className="vernacularName">{item.popularName + " "}</span> : null }
                                                <span className="scientificName">{item.scientificName}</span>
                                                <span className="author">{item.author && item.author.startsWith('(') ? item.author : '(' + item.author + ')'}</span>
                                            </div>
                                        </li>
                                    )}
                                    </ul>
                                </div> :
                                null}
                               {/* {newAssessment.taxonSearchWaitingForResult ?
                                <div  style={{zIndex: 10000, position: 'absolute', top: "40px", left:"35px"}}>
                                    <div  className={"three-bounce"}>
                                        <div className="bounce1" />
                                        <div className="bounce2" />
                                        <div className="bounce3" />
                                    </div>
                                </div> :
                               null} */}
                            </div>
                        </div>
                        
                        
                    </div>
                    <div className="row">                            
                            <div className="col-md-6">
                            <Xcomp.StringEnum observableValue={[newAssessment, "potensiellDørstokkart"]} mode="radio" codes={codes.SpeciesStatus}/>
                               {/* <Xcomp.Bool observableValue={[newAssessment, "potensiellDørstokkart"]} label={labels.SpeciesStatus.potentialDoorknocker} />
                                <Xcomp.Bool observableValue={[newAssessment, "øvrigeArter"]} label={labels.SpeciesStatus.otherSpecies} /> */}
                            </div>
                        </div>
                        <div className="col-md-6" style={{display: 'flex'}}>
                            <div>{labels.SelectAssessment.NBWritingAccess}</div>
                            <Xcomp.Button primary onClick={this.onNewAssessment} disabled={!rolle.skriver || (!newAssessment.ScientificName || checkForExistingAssessment(newAssessment.ScientificName + ' ' + newAssessment.ScientificNameAuthor))}>{labels.SelectAssessment.createAssessment}</Xcomp.Button>
                            {(newAssessment.ScientificName.length > 0 && !rolle.skriver || ( checkForExistingAssessment(newAssessment.ScientificName + ' ' + newAssessment.ScientificNameAuthor))) ? <div style={{color: 'red'}}>{labels.SelectAssessment.alreadyOnTheList}</div>: null}
                        </div>
                </fieldset>
            </div>
        )
    }
}



