import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const SpeciesSpeciesTable = observer((props) => 
{
    const labels = props.labels
    const disabled = props.disabled
    console.log("Disabled: " + disabled)
    return <table className="table ecologicalEffect">
        
        {!props.HCrit ? 
        <colgroup>
            <col style={{width: "20%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "20%"}} />
            <col style={{width: "20%"}} />
            <col style={{width: "15%"}} />
        </colgroup>
             :
             <colgroup>
             <col style={{width: "30%"}} />
             <col style={{width: "10%"}} />
             <col style={{width: "25%"}} />
             <col style={{width: "25%"}} />
             <col style={{width: "10%"}} />
         </colgroup>
              }
            {/*<col style={{width: "5%"}} />
            <col style={{width: "8%"}} />*/}

        
        <thead>
        <p>Legg til enkeltarter</p>
            <tr>
            
                <th dangerouslySetInnerHTML={{__html: labels.DEcrit.localSpecies}} ></th>
                {props.showKeyStoneSpecie ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.keystoneSpecies}} ></th> : null}
                {props.showEffect ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.effect}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.scope}} ></th>
                {props.showInteractionType ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.interactionType}} ></th> : null}
                <th style={{textAlign: 'center'}} 
                    dangerouslySetInnerHTML={{ __html: labels.DEcrit.assessmentBasis}}> 
                    </th>
                <th>&nbsp;</th>
               {/* <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.longDistanceEffect}} ></th>
                {props.showConfirmedOrAssumed ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.documented}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.domesticOrAbroad}} ></th>
 */}
            </tr>
        </thead>
        <tbody>
            {props.list.map(item =>
            <tr key={item.scientificName+item.effect+item.interactionType+item.keyStoneSpecie}>
                <td>
                    <div className="speciesItem">
                        <div className={"rlCategory " + item.redListCategory}>{item.redListCategory}</div>
                        <div className="vernacularName">{item.vernacularName}</div>
                        <div className="scientificName">{item.scientificName}</div>
                        <div className="author">{"(" + item.scientificNameAuthor + ")"}</div>
                    </div>
                </td>
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[item, 'keyStoneSpecie']} /></td> : null}
                {props.showEffect ? <td><Xcomp.StringEnum observableValue={[item, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td> : null}
                <td>
                <Xcomp.StringEnum observableValue={[item, 'scale']} forceSync codes={props.koder.speciesSpeciesScopeType}/>
                  {/*  <Xcomp.Bool observableValue={[item, 'effectLocalScale']} />*/}
                    </td>
                {props.showInteractionType ? <td>
                  <Xcomp.StringEnum observableValue={[item, 'interactionType']}   
                                    forceSync                                
                                    codes={props.koder.speciesSpeciesInteractionType} />
                    {/*<Xcomp.MultiselectArray
                                observableValue={[item, 'interactionTypes']} 
                    codes={props.koder.speciesSpeciesInteractionTypes}
                    mode="check"/> */}
                    </td> : null}
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                hideUnchecked
                                disabled={disabled}
                                //heading={props.koder.assessmentBackgrounds[0].text}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                disabled={disabled}
                                mode="check"
                                hideUnchecked/>
                            
                    {/*<Xcomp.Bool observableValue={[item, 'longDistanceEffect']} />*/}
                    </td>
                {/*{props.showConfirmedOrAssumed ? <td><Xcomp.Bool observableValue={[item, 'confirmedOrAssumed']} /></td> : null}
                <td><Xcomp.Bool observableValue={[item, 'domesticOrAbroad']} stringBool="True,False" /></td> */}

                <td><Xcomp.Button primary xs onClick={() => props.list.remove(item) }>
                    {/*{labels.General.delete}*/}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </Xcomp.Button></td>
            </tr>
            )}
            <tr className="newRow">
                <td>
              
                   <div style={{position: 'relative'}}>
                        {props.newItem.scientificName.length > 0 ?
                        <div 
                            className="speciesNewItem"
                            onClick={action(() => {
                                props.newItem.taxonId = "";
                                props.newItem.taxonRank = "";
                                props.newItem.scientificName = "";
                                props.newItem.scientificNameId = "";
                                props.newItem.scientificNameAuthor = "";
                                props.newItem.vernacularName = "";
                                props.newItem.redListCategory = "";
                                props.newItem.taxonSearchResult.replace([]); 
                                props.newItem.taxonSearchString = "" }) 
                            }
                        >
                            <div className={"rlCategory " + props.newItem.redListCategory}>{props.newItem.RedListCategory}</div>
                            <div className="vernacularName">{props.newItem.vernacularName}</div>
                            <div className="scientificName">{props.newItem.scientificName}</div>
                            <div className="author">{"(" + props.newItem.scientificNameAuthor + ")"}</div>
                        </div> :
                        <Xcomp.String className={props.HCrit ? "HCrit" : ""}  disabled={disabled} observableValue={[props.newItem, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />}
                        {props.newItem.taxonSearchResult.length > 0 ?
                        <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"15px"}}>
                            <ul className="panel list-unstyled">
                            {props.newItem.taxonSearchResult.map(item =>
                                <li onClick={action(e => {
                                    props.newItem.taxonId = item.taxonId;
                                    props.newItem.taxonRank = item.taxonRank;
                                    props.newItem.scientificName = item.scientificName;
                                    props.newItem.scientificNameId = item.scientificNameId;
                                    props.newItem.scientificNameAuthor = item.author;
                                    props.newItem.vernacularName = item.popularName;

                                    props.newItem.redListCategory = item.rlCategory;
                                    props.newItem.taxonSearchResult.replace([]); 
                                    props.newItem.taxonSearchString = "" })} 
                                    key={item.scientificName}
                                >
                                    <div className="speciesSearchItem">
                                        <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                        <div className="vernacularName">{item.popularName}</div>
                                        <div className="scientificName">{item.scientificName}</div>
                                        <div className="author">{"(" + item.author + ")"}</div>
                                    </div>
                                </li>
                            )}
                            </ul>
                        </div> :
                        null}
                        {props.newItem.taxonSearchWaitingForResult ?
                        <div  style={{zIndex: 10000, position: 'absolute', top: "40px", left:"35px"}}>
                            <div  className={"three-bounce"}>
                                <div className="bounce1" />
                                <div className="bounce2" />
                                <div className="bounce3" />
                            </div>
                        </div> :
                        null}
                        </div> 
                </td>
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[props.newItem, 'keyStoneSpecie']} /></td> : null}
                {props.showEffect ? <td><Xcomp.StringEnum observableValue={[props.newItem, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td> : null}
                <td>
                    <Xcomp.StringEnum observableValue={[props.newItem, 'scale']} forceSync codes={props.koder.speciesSpeciesScopeType} />
                  {/*  <Xcomp.Bool observableValue={[props.newItem, 'effectLocalScale']} /> */}
                </td>
                {props.showInteractionType ? <td>
                    {/* <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'interactionTypes']} 
                                codes={props.koder.speciesSpeciesInteractionTypes}
                                mode="check"/>*/}
                   <Xcomp.StringEnum observableValue={[props.newItem, 'interactionType']} forceSync codes={props.koder.speciesSpeciesInteractionType} />
                    
                    
                    </td> : null}
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                hideUnchecked
                                disabled={disabled}
                                //heading={props.koder.assessmentBackgrounds[0].text}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked
                                disabled={disabled}
                                />

                    {/*<div className="option" tabindex="0">
                                <div class="row filter" style="margin: 0; padding-top: 5px" 
                                //data-bind="click: function () {toggleArrow('svalbard', svalbardVisible)}"
                                >
                                    <span>@fbLabel("searchChooseArea")</span>
                                    <span class="arrow_down" id="svalbard">
                                        <img src="/Content/images/keyboard_arrow_down-24px.svg" alt="Arrow down"></img>
                                    </span>
                                </div>
                                <div class="filter-group" style="cursor: pointer">
                                    <ul style="padding-left: 0">
                                        <li class="checkbox" style="margin-top: 0;" 
                                        //data-bind="visible: svalbardFilter.indexOf('N') > -1 || svalbardVisible"
                                        >
                                            <label class="checkbox">
                                                <input type="checkbox" name="vurderingsområde" value="N" 
                                                //data-bind="checked: svalbardFilter" 
                                                />Norge
                                            </label>
                                        </li>
                                        <li class="checkbox" style="margin-top: 0;" 
                                        //data-bind="visible: svalbardFilter.indexOf('S') > -1 || svalbardVisible"
                                        >
                                            <label class="checkbox">
                                                <input type="checkbox" name="vurderingsområde" value="S" 
                                                //data-bind="checked: svalbardFilter" 
                                                />Svalbard
                                            </label>
                                        </li>
                                    </ul>
                                </div>
                            </div>*/}
                    {/*<Xcomp.Bool observableValue={[props.newItem, 'longDistanceEffect']} />*/}
                </td>
               {/* {props.showConfirmedOrAssumed ? <td><Xcomp.Bool observableValue={[props.newItem, 'confirmedOrAssumed']} /></td> : null}
                <td><Xcomp.Bool observableValue={[props.newItem, 'domesticOrAbroad']} stringBool="True,False" /></td> */}
                <td>
                    <div>
                        <Xcomp.Button primary xs 
                            onClick={props.addNewItem}
                            disabled={!props.newItem.scientificName}
                        >{labels.General.add}</Xcomp.Button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>})

export default SpeciesSpeciesTable


