// import config from '../../config';
import config from '../../config';
import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';

import * as Xcomp from './observableComponents';
import {action, autorun, computed, extendObservable, observable, toJS} from 'mobx';
import NewMigrationPathwaySelector from './40Spredningsveier/NewMigrationPathwaySelector'
import MPTable from './40Spredningsveier/MigrationPathwayTable'
const labels = config.labels

@inject("appState")
@observer
export default class Assessment42Spredningsveier extends React.Component {
    constructor(props) {
        super(props);
        extendObservable(this, {
            visibleDefinitions: false,
        })

        this.toggleDefinitions = (e) => {
            action(() => {
               // e.stopPropagation();
                this.visibleDefinitions = !this.visibleDefinitions
                console.log(this.visibleDefinitions)
            })()
        }

    }
    // searches through the code tree to find the category name and the main category name
    getCategoryText(val, pathways) {
        var text = ""
        if (pathways != undefined) {
            pathways.map (pathway => pathway.children.map(higherLevel => { 
                higherLevel.children.map(lowerLevel => {if (lowerLevel.value === val) { 
                                                                            text = higherLevel.name + " - " + lowerLevel.name + ": "
                                                                            }})     
            }))
            
        }
        return text
    }
    // removes <br>-tag from elaborateInformation-field
    removeBreaks (text) {
        var br = new RegExp('<br>', 'ig');
        text = text.replace(br, '');
        return text
    }

    // changing the category of "Direkte import" til "Rømning/forvilling"
    changeCategory (cat) {
        switch (cat) {
            case 'importAgriculture' : 
                return 'agriculture';
            case 'importAquaculture' : 
                return 'aquaculture';
            case 'importHorticulture' : 
                return 'horticulture';
            case 'importBotanicalGardenZooAquarium': 
                return 'botanicalGardenZooAquarium';
            case 'importPetShops' : 
                return 'petAquariumTerrariumSpecies';
            case 'importFarmedAnimals' :
                return 'farmedAnimals';
            case 'importForestry' :
                return 'forestry';
            case 'importFurFarms' :
                return 'furFarms';
            case 'importOrnamentalPurposeOther': 
                return 'ornamentalPurposeOther';
            case 'importResearch' :
                return 'research';
            case 'importLiveFoodLiveBait': 
                return 'petAquariumTerrariumFood';
            case 'importOtherEscape' :
                return 'otherEscape'
            default: 
                return ""
        }
    }

   
    @action saveMigrationPathway(vurdering, mp, name, migrationPathways) {
        const mps = name == "Til innendørs- eller produksjonsareal" ? vurdering.importPathways : vurdering.assesmentVectors
        const compstr = (mp) => ""+mp.codeItem+mp.introductionSpread+mp.influenceFactor+mp.magnitude+mp.timeOfIncident

       
        const introSpread = name == "Videre spredning i natur" ? "spread" : "introduction"
        mp.introductionSpread = introSpread
        
        const newMp = compstr(mp)
        const existing = mps.filter(oldMp =>  compstr(oldMp) === newMp
        )
        if (existing.length > 0) {
            console.log("Spredningsvei finnes allerede i vurderingen")
        } else {
            const clone = toJS(mp)
            mps.push(clone); // must use clone to avoid that multiple items in the list is the same instance! 

            // if the migration pathway is in "Til innendørs- eller produksjonsareal", then we have to add a matching pathway into "Introduksjon..."
            if (name == "Til innendørs- eller produksjonsareal") {
                
                if (mp.mainCategory != "Direkte import") {
                    var copy = mp
                    // setting influence factor, magnitude and time of incident of the new pathway as null
                    copy.influenceFactor = null
                    copy.magnitude = null
                    copy.timeOfIncident = null
                    
                    const newCopy = toJS(copy)
                    vurdering.assesmentVectors.push(newCopy)
                } else {
                    var copy = mp
                    // changing the main category
                    copy.mainCategory = "Rømning/forvilling"

                    copy.codeItem = this.changeCategory(mp.codeItem)
                    console.log(copy.codeItem)

                    if (copy.codeItem != ""){
                        var cat = this.getCategoryText(copy.codeItem, migrationPathways).split("-")
                        copy.category = cat[1].substr(1, cat[1].length-3)
                    } else {
                        copy.category = ""
                    }
                    
                     // setting influence factor, magnitude and time of incident of the new pathway as null
                     copy.influenceFactor = null
                     copy.magnitude = null
                     copy.timeOfIncident = null
                     
                     // if there is a matching category in "Rømning/forvilling", add the migration pathway to the "Introduction" table
                     if (copy.category != "") {

                        const newCopy = toJS(copy)          
                        console.log(newCopy)           
                        vurdering.assesmentVectors.push(newCopy)
                     }
                     
                }
                
            }
            
        }
        // this.showEditMigrationPathway = false;
    }

    
   

    @action fjernSpredningsvei = (vurdering, value, name) => {
        const result = name == "Til innendørs- eller produksjonsareal" ?  vurdering.importPathways.remove(value) : vurdering.assesmentVectors.remove(value);
        // console.log("item removed : " + result)
    };

    render() {
        const {appState:{assessment:{riskAssessment}}, appState:{assessment}, appState, name, furtherInfo} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder
        
        const importationCodes = 
            name == "Til innendørs- eller produksjonsareal" 
            ? koder.migrationPathways[0].Children.mp[0].Children.mpimport 
            : name == "Introduksjon til natur" 
            ? koder.migrationPathways[0].Children.mp[0].Children.mpimportation 
            : name == "Videre spredning i natur" ? koder.migrationPathways[0].Children.mp[0].Children.mpspread : null 
      
        const migrationPathways = 
            name == "Til innendørs- eller produksjonsareal" 
            ? assessment.importPathways 
            : name == "Videre spredning i natur" 
            ? assessment.assesmentVectors.filter(vector => vector.introductionSpread == "spread") 
            : name == "Introduksjon til natur" ? assessment.assesmentVectors.filter(vector => vector.introductionSpread == "introduction") : null

        const migrationPathwayKoder = 
            name == "Til innendørs- eller produksjonsareal" 
            ? appState.spredningsveier.children.filter(child => child.name == "Import")
            : name == "Videre spredning i natur" 
            ? appState.spredningsveier.children.filter(child => child.name == "Videre spredning" || child.name == "Spredning")
            : appState.spredningsveier.children.filter(child => child.name != "Import" && child.name != "Videre spredning")

        const observableDef = 
            name == "Til innendørs- eller produksjonsareal" 
            ? [assessment, "spreadIndoorFurtherInfo"] 
            : name == "Videre spredning i natur" 
            ? [assessment, "spreadFurtherSpreadFurtherInfo"] 
            : [assessment, "spreadIntroductionFurtherInfo"] 
              
        const observableGeneratedStringDef = 
            name == "Til innendørs- eller produksjonsareal" 
            ? [assessment, "spreadIndoorFurtherInfoGeneratedText"] 
            : name == "Videre spredning i natur" 
            ? [assessment, "spreadFurtherSpreadFurtherInfoGeneratedText"] 
            : [assessment, "spreadIntroductionFurtherInfoGeneratedText"] 
        
    //     // sets the string composed of all elaborate information and related categories
    //     var elaborateInformation = ""

    //     if (migrationPathways != []) {

    //         for (var i = 0; i < migrationPathways.length; i++) {
    //             if (migrationPathways[i].elaborateInformation != "") {
    //                 var categoryText = this.getCategoryText(migrationPathways[i].codeItem, appState.spredningsveier.children)
    //                 elaborateInformation += categoryText + this.removeBreaks(migrationPathways[i].elaborateInformation) + "." + "<br>"                       
    //             }
                
    //         }
    //     }
    //    riskAssessment.furtherInfoAboutImport = elaborateInformation


        //console.log(appState.spredningsveier.children)
        // const labels = fabModel.kodeLabels
        // console.log("''''''''''''''''''''''")
        // console.log(JSON.stringify(migrationPathwayKoder))
        const nbsp = "\u00a0"
        // console.log("fabModel" + fabModel.toString() )
        // console.log("koder" + fabModel.koder.toString() )
        const fjernSpredningsvei = (mp) => this.fjernSpredningsvei(vurdering, mp, name)
        const directImport = "Arten blir tilsikta satt ut i et innendørs-miljø eller på produksjonsareal."
        const release = "Arten blir tilsikta satt ut direkte i norsk natur (utenfor artens eventuelle produksjonsareal), med den hensikt at arten overlever i naturen."
        const escape = "Arten ble tilsikta satt ut i et innendørs-miljø eller på produksjonsareal, mens det ikke var den opprinnelige hensikten at arten kommer ut i norsk natur; dette inkluderer også dumping eller frislipp av bruksarter."
        const corridor = "Arten sprer seg selvstendig, men via eller ved hjelp av menneskeskapte strukturer."
        const naturalDispersal = "Arten sprer seg selvstendig og ikke via menneskeskapte strukturer."
        
        return(
            <fieldset className="well">
                
               {/* 
                    div style={{marginBottom: "30px"}}
                { true || config.showPageHeaders ? <h4 style={{marginTop: "25px"}} >{labels.MigrationPathway.introductionSpread}</h4> : <br />} */}
                <h4>{name}</h4>
                <div className="import">
                <div className="well">
                    <h5>Legg til spredningsvei</h5>
                    <NewMigrationPathwaySelector migrationPathways={migrationPathwayKoder} onSave={mp => this.saveMigrationPathway(vurdering, mp, name, appState.spredningsveier.children)} mainCodes={koder} koder={importationCodes} vurdering={vurdering} labels={labels} />
                </div>
                <div className="definitions">
                    <button className="btn btn-primary" onClick={this.toggleDefinitions}>Se definisjoner</button>
                    
                    {this.visibleDefinitions && 
                    <p>
                        {name == "Til innendørs- eller produksjonsareal" && <><b>Direkte import: </b> {directImport} <br/></>  }
                        {(name == "Introduksjon til natur" || name == "Videre spredning i natur") && <><b>Tilsiktet utsetting: </b> {release} <br/></> }
                        {name == "Introduksjon til natur" &&  <><b>Rømning/forvilling: </b> {escape} <br/></> }
                        <b>Forurensning av vare: </b>Arten følger utilsikta med under transport av andre arter eller gjenstander (vektorer) og har en spesifikk økologisk tilknytning til den andre arten eller til det organiske mediet som ble transportert.
                        <br/>
                        <b>Blindpassasjer med transport: </b>Arten følger utilsikta med under transport av andre arter eller gjenstander (vektorer), men har bare en nokså tilfeldig tilknytning til varen eller gjenstanden som ble transportert, eller til selve transportmiddelet.
                        <br/>
                        {(name == "Introduksjon til natur" || name == "Videre spredning i natur") && <><b>Korridor: </b> {corridor} <br/>
                                                                <b>Egenspredning: </b> {naturalDispersal}</>  }
                    </p>
                }
                </div>
                </div>
                {migrationPathways.length > 0 &&
                <>
                    <h4>{labels.MigrationPathway.chosenPathways}</h4>
                    <MPTable migrationPathways={migrationPathways} removeMigrationPathway={fjernSpredningsvei} showIntroductionSpread getCategoryText={this.getCategoryText} migrationPathwayCodes={appState.spredningsveier.children}/>
                </>
                     
                }
                <hr/>
                
                <p dangerouslySetInnerHTML={{__html: furtherInfo}}></p>
                <Xcomp.HtmlString                            
                                observableValue={observableDef}
                                // observableValue={[riskAssessment, "furtherInfoAboutImport"]}
                                //label={labels.DEcrit.insecurity}
                                
                               // value={elaborateInformation}
                                //placeholder={labels.Import.furtherInfoComment}
                                />
                <Xcomp.HtmlString className="generatedText" observableValue={observableGeneratedStringDef} disabled />

            </fieldset>
        );
    }
}




// Assessment42Spredningsveier.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
