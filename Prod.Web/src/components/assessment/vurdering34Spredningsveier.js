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
export default class Vurdering34Spredningsveier extends React.Component {
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
                return 'otherUnknownRelease'
            default: 
                return ""
        }
    }

   
    @action saveMigrationPathway(vurdering, mp, name, migrationPathways) {
        const mps = name == "Til innendørs- eller produksjonsareal" ? vurdering.importPathways : vurdering.assesmentVectors
        const compstr = (mp) => ""+mp.codeItem+mp.introductionSpread+mp.influenceFactor+mp.magnitude+mp.timeOfIncident

       

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
                console.log(mp)
                if (mp.mainCategory != "Direkte import") {
                    var copy = mp
                    // setting influence factor, magnitude and time of incident of the new pathway as null
                    copy.influenceFactor = null
                    copy.magnitude = null
                    copy.timeOfIncident = null
                    
                    newCopy = toJS(copy)
                    vurdering.assesmentVectors.push(newCopy)
                } else {
                    var copy = mp
                    // changing the main category
                    copy.mainCategory = "Rømning/forvilling"

                    copy.codeItem = this.changeCategory(mp.codeItem)

                    var cat = this.getCategoryText(copy.codeItem, migrationPathways).split("-")
                    copy.category = cat[1].substr(1, cat[1].length-3)
                     // setting influence factor, magnitude and time of incident of the new pathway as null
                     copy.influenceFactor = null
                     copy.magnitude = null
                     copy.timeOfIncident = null
                     console.log(copy)
                     newCopy = toJS(copy)
                     vurdering.assesmentVectors.push(newCopy)
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
        
        const importationCodes = name == "Til innendørs- eller produksjonsareal" ? koder.migrationPathways[0].Children.mp[0].Children.mpimport : 
                                name == "Introduksjon til natur" ? koder.migrationPathways[0].Children.mp[0].Children.mpimportation : 
                                name == "Videre spredning i natur" ? koder.migrationPathways[0].Children.mp[0].Children.mpspread : null 
        // const {vurdering, viewModel, fabModel} = this.props;
       // const introductionSpread = name == "Introduksjon til natur" ? "introduction" : name == "Videre spredning i natur" ? "spread" : null
       // const migrationPathways = assessment.assesmentVectors.filter(pathway => pathway.introductionSpread == introductionSpread)
      
       const migrationPathways = name == "Til innendørs- eller produksjonsareal" ? assessment.importPathways :        
                                name == "Videre spredning i natur" ? assessment.assesmentVectors.filter(vector => vector.introductionSpread == "spread") : 
                                name == "Introduksjon til natur" ? assessment.assesmentVectors.filter(vector => vector.introductionSpread == "introduction") : null

               
        //const migrationPathwayKoder = appState.spredningsveier.children.filter(child => child.name != "Import")
       const migrationPathwayKoder = name == "Til innendørs- eller produksjonsareal" ? appState.spredningsveier.children.filter(child => child.name == "Import") :
                                  name == "Videre spredning i natur" ? appState.spredningsveier.children.filter(child => child.name == "Videre spredning" || child.name == "Spredning")
                                   : appState.spredningsveier.children.filter(child => child.name != "Import" && child.name != "Videre spredning")

             
        
        
        // sets the string composed of all elaborate information and related categories
        var elaborateInformation = ""

        if (migrationPathways != []) {

            for (var i = 0; i < migrationPathways.length; i++) {
                if (migrationPathways[i].elaborateInformation != "") {
                    var categoryText = this.getCategoryText(migrationPathways[i].codeItem, appState.spredningsveier.children)
                    elaborateInformation += categoryText + this.removeBreaks(migrationPathways[i].elaborateInformation) + "." + "<br>"                       
                }
                
            }
        }
       riskAssessment.furtherInfoAboutImport = elaborateInformation


        //console.log(appState.spredningsveier.children)
        // const labels = fabModel.kodeLabels
        // console.log("''''''''''''''''''''''")
        // console.log(JSON.stringify(migrationPathwayKoder))
        const nbsp = "\u00a0"
        // console.log("fabModel" + fabModel.toString() )
        // console.log("koder" + fabModel.koder.toString() )
        const fjernSpredningsvei = (mp) => this.fjernSpredningsvei(vurdering, mp, name)

        
        return(
            <fieldset className="well">
                
               {/* 
                    div style={{marginBottom: "30px"}}
                { true || config.showPageHeaders ? <h4 style={{marginTop: "25px"}} >{labels.MigrationPathway.introductionSpread}</h4> : <br />} */}
                <h4>{name}</h4>
                {migrationPathways.length > 0 &&
                     <MPTable migrationPathways={migrationPathways} removeMigrationPathway={fjernSpredningsvei} showIntroductionSpread getCategoryText={this.getCategoryText} migrationPathwayCodes={appState.spredningsveier.children}/>
                }
                <hr/>
                <div className="import">
                <div className="well">
                    <h4>Legg til spredningsvei</h4>
                    <NewMigrationPathwaySelector migrationPathways={migrationPathwayKoder} onSave={mp => this.saveMigrationPathway(vurdering, mp, name, appState.spredningsveier.children)} mainCodes={koder} koder={importationCodes} vurdering={vurdering} labels={labels} />
                </div>
                <div className="definitions">
                    <button className="btn btn-primary" onClick={this.toggleDefinitions}>Se definisjoner</button>
                    
                    {this.visibleDefinitions && 
                    <p>
                        <b>Forurensning av vare: </b>Arten følger med <i>levende/døde organismer</i> eller <i>organisk materiale</i> som parasitt (dvs. den transporterte organismen er vektor) eller som annen «smitte»
                        <br/>
                        <b>Blindpassasjer med/på transport: </b>Arten følger med under transport av <i>mennesker, varer</i> eller <i>kjøretøy/fartøy</i>.

                    </p>
                }
                </div>
                </div>
                <p>{furtherInfo}</p>
                <Xcomp.HtmlString                            
                                observableValue={[riskAssessment, "furtherInfoAboutImport"]}
                                //label={labels.DEcrit.insecurity}
                                
                               // value={elaborateInformation}
                                //placeholder={labels.Import.furtherInfoComment}
                                />
            </fieldset>
        );
    }
}




// Vurdering34Spredningsveier.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
