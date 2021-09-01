
import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const HostParasiteTable = observer((props) => 
{
    // const {appState} = props;
    // const labels = appState.codeLabels
    // const koder = appState.koder
    const labels = props.labels
    const koder = props.koder
    // console.log("hostkoder: "  + JSON.stringify(Object.keys(koder)))
    // console.log("ParasiteEcoEffectCodes: "  + JSON.stringify(koder.ParasiteEcoEffectCodes))


    return <table className="table ecologicalEffect">
        <colgroup>
            <col style={{width: "10%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "35%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "10%"}} />
            {/*<col style={{width: "5%"}} />
            <col style={{width: "5%"}} />*/}
            <col style={{width: "5%"}} />
        </colgroup>
        <thead>
            <tr>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localSpecie}}></th>
                {props.showKeyStoneSpecie ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.keystoneSpecies}}></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteScientificname}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteStatus}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.scope}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteEffectScore}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.assessmentBasis}}></th>
               {/* <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteEcoEffect}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localScale}} ></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteNew}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteAlien}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.diseaseDocumented}}></th>
        <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.domesticOrAbroad}} ></th>*/}
                <th>&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {props.list.map(item =>
            <tr key={
                item.scientificName+
                item.keyStoneSpecie+
                item.parasiteScientificName+
                item.parasiteEcoEffect+
                item.effectLocalScale+
                item.parasiteNewForHost+
                item.parasiteIsAlien+
                item.diseaseConfirmedOrAssumed+
                item.domesticOrAbroad
                }>
                    {/* <td>Item:{JSON.stringify(item)}</td> */}
                <td>
                    <div className="speciesItem">
                        <div className={"rlCategory " + item.redListCategory}>{item.redListCategory}</div>
                        <div className="vernacularName">{item.vernacularName}</div>
                        <div className="scientificName">{item.scientificName}</div>
                        <div className="author">{"(" + item.scientificNameAuthor + ")"}</div>
                    </div>
                </td>
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[item, 'keyStoneSpecie']} /></td> : null}
                <td style={{maxWidth: '160px'}}>{item.ParasiteScientificName}</td>
                <td>
                    <Xcomp.StringEnum observableValue={[item, 'status']} forceSync codes={koder.ParasiteStatus}/>   
                </td>
                <td>
                    <Xcomp.StringEnum observableValue={[item, 'scale']} forceSync codes={koder.speciesSpeciesScopeType}/>
                </td>
                <td>
                    <Xcomp.StringEnum observableValue={[item, 'parasiteEcoEffect']} forceSync codes={koder.ParasiteEcoEffectCodes} />
                </td>
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked/>
                </td>
                {/*<td><Xcomp.StringEnum observableValue={[item, 'parasiteEcoEffect']} forceSync codes={koder.ParasiteEcoEffectCodes} /></td>
                <td><Xcomp.Bool observableValue={[item, 'effectLocalScale']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'parasiteNewForHost']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'parasiteIsAlien']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'diseaseConfirmedOrAssumed']} /></td>
            <td><Xcomp.Bool observableValue={[item, 'domesticOrAbroad']} stringBool="True,False" /></td>*/}

                <td><Xcomp.Button primary xs onClick={() => props.list.remove(item) }>{labels.General.delete}</Xcomp.Button></td>
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
                            <div className={"rlCategory " + props.newItem.redListCategory}>{props.newItem.redListCategory}</div>
                            <div className="vernacularName">{props.newItem.vernacularName}</div>
                            <div className="scientificName">{props.newItem.scientificName}</div>
                            <div className="author">{"(" + props.newItem.scientificNameAuthor + ")"}</div>
                        </div> :
                        <Xcomp.String observableValue={[props.newItem, 'taxonSearchString']} placeholder={labels.DEcrit.searchSpecies} />}
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
               {/* {props.showRedlist ? <td><Xcomp.String observableValue={[props.newItem, 'redListCategory']} /></td> : null}*/}
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[props.newItem, 'keyStoneSpecie']} /></td> : null}
                <td><Xcomp.String className="parasiteName" observableValue={[props.newItem, 'parasiteScientificName']} /></td>
                <td>
                    <Xcomp.StringEnum observableValue={[props.newItem, 'status']}  codes={koder.ParasiteStatus}/>                
                </td>
                <td>
                    <Xcomp.StringEnum observableValue={[props.newItem, 'scale']} forceSync codes={koder.speciesSpeciesScopeType}/>
                </td>
                <td>
                    <Xcomp.StringEnum observableValue={[props.newItem, 'parasiteEcoEffect']} forceSync codes={koder.ParasiteEcoEffectCodes} />
                </td>
                <td>
                
                 <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked
                                />
                                
                </td>
                {/*<td><Xcomp.StringEnum observableValue={[props.newItem, 'parasiteEcoEffect']} forceSync codes={koder.ParasiteEcoEffectCodes} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'effectLocalScale']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'parasiteNewForHost']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'parasiteIsAlien']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'diseaseConfirmedOrAssumed']} /></td>
                        <td><Xcomp.Bool observableValue={[props.newItem, 'domesticOrAbroad']} stringBool="True,False" /></td>*/}
                <td>
                    <Xcomp.Button primary xs
                        onClick={props.addNewItem}
                        disabled={!props.newItem.ScientificName || !props.newItem.ParasiteScientificName }
                    >{labels.General.add}</Xcomp.Button>
                </td>
            </tr>
        </tbody>
    </table>})

export default HostParasiteTable