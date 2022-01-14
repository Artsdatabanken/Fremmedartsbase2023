import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const SpeciesNaturetypeTable = observer((props) => 
{
    const labels = props.labels
    const disabled = props.disabled
    const natureTypeCodes = require('./../../../Nin2_3.json')
    var naturetypeNames = []
    naturetypeNames.push({"Value": "", "Text": ""})
    // regular expression to check that the id does not contain only numbers
    const reg = /^\d+$/;
    const findNTName = (nt) => {
        var name = "";
        const id = nt.niNCode
        if (id) {

            if(!reg.test(id)){
                if (id.startsWith("NA")) {
                    // taking only the last part of the code
                    id = id.substring(3)

                }
                if (id.length == 1) {
                    name = natureTypeCodes.Children.find(code => code.Id.indexOf(id) > -1).Text
                } else if (id.length == 2) {
                    // search for the name on the second level of nature type groups     
                    
                    var firstSubLevel = natureTypeCodes.Children 
                   
                    for (var i = 0; i < firstSubLevel.length; i++) {
                        if (firstSubLevel[i].Id.indexOf(id.substring(0,1)) > -1) {
                            
                            name = firstSubLevel[i].Children.find(code => code.Id.indexOf(id) > -1).Text                            
                        }
                    }
                } else if (id.length > 2) {
                    var firstPart = id.split("-")[0]
                    // search for the name on the third level of nature type groups                
                    var firstSubLevel = natureTypeCodes.Children
                    for (var i = 0; i < firstSubLevel.length; i++) {
                       
                        if (firstSubLevel[i].Id.indexOf(id.substring(0,1)) > -1) {
                            var secondSubLevel = firstSubLevel[i].Children
                             
                            for (var j = 0; j < secondSubLevel.length; j++) {
                                
                                if (secondSubLevel[j].Id == firstPart || secondSubLevel[j].Id == "NA "+ firstPart) {
                                    var thirdSubLevel = secondSubLevel[j].Children
                                    name = thirdSubLevel.find(code => code.Id.indexOf(id) > -1).Text
                                }
                            }                                           
                        }
                    }
                }

            } else {
                
                for (var i = 0; i < redListCodes.Children.length; i++) {
                    for (var j = 0; j < redListCodes.Children[i].Children.length; j++) {
                        if (redListCodes.Children[i].Children[j].Id == id) {
                            name = redListCodes.Children[i].Children[j].Text
                        }
                    }
                }
            }
        }
        nt.name = name      
        return name
    } 

    if (props.natureTypes && props.natureTypes.length > 0) {
        
        for (var i = 0; i < props.natureTypes.length; i++){
            naturetypeNames.push({"Value": props.natureTypes[i].niNCode, "Text": findNTName(props.natureTypes[i])});
        }
        
    }

    
    return <table className="table ecologicalEffect">
        

        <colgroup>
            <col style={{width: "20%"}} />
            {/*<col style={{width: "8%"}} />*/}
            <col style={{width: "15%"}} />
            <col style={{width: "16%"}} />
            <col style={{width: "25%"}} />

            <col style={{width: "25%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
           {/* <col style={{width: "5%"}} />
            <col style={{width: "8%"}} /> */}

        </colgroup>

        
        <thead>
        <p>Legg til grupper av arter</p>
            <tr>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.speciesInNaturetype}} ></th>
                {props.showKeyStoneSpecie ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.keystoneOrEndangeredSpecies}} ></th> : null}
                {props.showEffect ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.effect}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.scope}} ></th>
                {props.showInteractionType ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.interactionType}} ></th> : null}
                <th style={{textAlign: 'center'}} dangerouslySetInnerHTML={{ __html: labels.DEcrit.assessmentBasis}} ></th>
                <th>&nbsp;</th>                
               {/* <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.longDistanceEffect}} ></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.documented}} ></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.domesticOrAbroad}} ></th> */}
            </tr>
        </thead>
        <tbody>
            {props.list.map(item =>
            <tr key={item.niNCode+item.effect+item.interactionType+item.keyStoneSpecie+item.effectLocalScale}>
                <td>
                    <div className="naturtypeItem">
                        <div className="naturtypeCode">{item.niNCode}</div>
                        <div className="naturtypeName">{props.naturtypeLabels[item.niNCode]}</div>
                    </div>
                </td>
                <td><Xcomp.Bool observableValue={[item, 'keyStoneOrEndangeredSpecie']} /></td>
                <td><Xcomp.StringEnum observableValue={[item, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td>
                <td>
                    {/*<Xcomp.Bool observableValue={[item, 'effectLocalScale']} />*/}
                    <Xcomp.StringEnum observableValue={[item, 'scale']} forceSync codes={props.koder.speciesSpeciesScopeType} />
                </td>
                <td>
                    <Xcomp.StringEnum observableValue={[item, 'interactionType']} forceSync codes={props.koder.speciesSpeciesInteractionType} />
                   {/* <Xcomp.MultiselectArray
                                observableValue={[item, 'interactionTypes']} 
                                codes={props.koder.speciesSpeciesInteractionTypes}
                    mode="check"/>*/}
                </td>
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                hideUnchecked
                                disabled={disabled}
                                //heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked
                                disabled={disabled}
                                />
                    {/*<Xcomp.Bool observableValue={[item, 'longDistanceEffect']} />*/}
                    
                 </td>
                {/*<td><Xcomp.Bool observableValue={[item, 'confirmedOrAssumed']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'domesticOrAbroad']} stringBool="True,False" /></td>*/}
                <td><Xcomp.Button primary xs onClick={() => props.list.remove(item) }>
                   {/* {labels.General.delete} */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                </Xcomp.Button></td>
            </tr>
            )}
            {/* new row for adding nature types shows only if there are any nature types chosen in the respective tab */}
            {naturetypeNames && naturetypeNames.length > 0 && <tr className="newRow">
                <td>
              <Xcomp.StringEnum 
                        observableValue={[props.newItem, "niNCode"]}  
                        forceSync                                      
                        codes={naturetypeNames}/>     
              
                  {/*  <select className="form-control" disabled={disabled} placeholder="velg naturtype" value={props.newItem.niNCode} options={naturetypeNames}
                            onChange={action(e => props.newItem.niNCode = e.target.value)}
                 > */}

                        {/*//todo: uncomment this when we have naturetypeLabels
                         { props.newItem.naturetypes.map(nt => {
                            const ninlabel = props.naturtypeLabels ? props.naturtypeLabels[nt.niNCode] : ""
                            const label = nt.niNCode + " " + ninlabel
                            return <option value={nt.niNCode} key={nt.niNCode}>{label}</option>})} 
                            
                            </select>  
                            */}
                                      

                </td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'keyStoneOrEndangeredSpecie']} /></td>
                <td><Xcomp.StringEnum observableValue={[props.newItem, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td>
                <td>
                    <Xcomp.StringEnum observableValue={[props.newItem, 'scale']} forceSync codes={props.koder.speciesSpeciesScopeType} />
                    {/*<Xcomp.Bool observableValue={[props.newItem, 'effectLocalScale']} />*/}
                    </td>
                <td>
                   <Xcomp.StringEnum observableValue={[props.newItem, 'interactionType']} forceSync codes={props.koder.speciesSpeciesInteractionType} /> 
                   {/*  <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'interactionTypes']} 
                                codes={props.koder.speciesSpeciesInteractionTypes}
                                mode="check"/>*/}
                </td>
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                hideUnchecked
                                disabled={disabled}
                                //heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
                                disabled={disabled}
                                hideUnchecked
                                />
                    {/*<Xcomp.Bool observableValue={[props.newItem, 'longDistanceEffect']} />*/}
                    
                </td>
               {/* <td><Xcomp.Bool observableValue={[props.newItem, 'confirmedOrAssumed']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'domesticOrAbroad']} stringBool="True,False" /></td>*/}
                <td>
                    <div>
                        <Xcomp.Button primary xs 
                            onClick={props.addNewItem}
                            disabled={props.newItem.niNCode == ""}
                        >{labels.General.add}</Xcomp.Button>
                    </div>
                </td>
            </tr>}
        </tbody>
    </table>})

export default SpeciesNaturetypeTable


