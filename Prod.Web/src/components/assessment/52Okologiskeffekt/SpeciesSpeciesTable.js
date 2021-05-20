import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const SpeciesSpeciesTable = observer((props) => 
{
    const labels = props.labels
    return <table className="table">
        <colgroup>
            <col style={{width: "30%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "16%"}} />
            <col style={{width: "5%"}} />

            <col style={{width: "21%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "8%"}} />

        </colgroup>

        <thead>
            <tr>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localSpecies}} ></th>
                {props.showKeyStoneSpecie ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.keystoneSpecies}} ></th> : null}
                {props.showEffect ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.effect}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localScale}} ></th>
                {props.showInteractionType ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.interactionType}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.longDistanceEffect}} ></th>
                {props.showConfirmedOrAssumed ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.documented}} ></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.domesticOrAbroad}} ></th>
                <th>&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {props.list.map(item =>
            <tr key={item.scientificName+item.effect+item.interactionType+item.keyStoneSpecie}>
                <td>
                    <div className="speciesItem">
                        <div className={"rlCategory " + item.redListCategory}>{item.RedListCategory}</div>
                        <div className="vernacularName">{item.vernacularName}</div>
                        <div className="scientificName">{item.scientificName}</div>
                        <div className="author">{"(" + item.scientificNameAuthor + ")"}</div>
                    </div>
                </td>
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[item, 'keyStoneSpecie']} /></td> : null}
                {props.showEffect ? <td><Xcomp.StringEnum observableValue={[item, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td> : null}
                <td><Xcomp.Bool observableValue={[item, 'effectLocalScale']} /></td>
                {props.showInteractionType ? <td><Xcomp.StringEnum observableValue={[item, 'interactionType']} forceSync codes={props.koder.speciesSpeciesInteractionType} /></td> : null}
                <td><Xcomp.Bool observableValue={[item, 'longDistanceEffect']} /></td>
                {props.showConfirmedOrAssumed ? <td><Xcomp.Bool observableValue={[item, 'confirmedOrAssumed']} /></td> : null}
                <td><Xcomp.Bool observableValue={[item, 'domesticOrAbroad']} stringBool="True,False" /></td>

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
                            <div className={"rlCategory " + props.newItem.redListCategory}>{props.newItem.RedListCategory}</div>
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
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[props.newItem, 'keyStoneSpecie']} /></td> : null}
                {props.showEffect ? <td><Xcomp.StringEnum observableValue={[props.newItem, 'effect']} forceSync codes={props.koder.speciesSpeciesEffectType} /></td> : null}
                <td><Xcomp.Bool observableValue={[props.newItem, 'effectLocalScale']} /></td>
                {props.showInteractionType ? <td><Xcomp.StringEnum observableValue={[props.newItem, 'interactionType']} forceSync codes={props.koder.speciesSpeciesInteractionType} /></td> : null}
                <td><Xcomp.Bool observableValue={[props.newItem, 'longDistanceEffect']} /></td>
                {props.showConfirmedOrAssumed ? <td><Xcomp.Bool observableValue={[props.newItem, 'confirmedOrAssumed']} /></td> : null}
                <td><Xcomp.Bool observableValue={[props.newItem, 'domesticOrAbroad']} stringBool="True,False" /></td>
                <td>
                    <div>
                        <Xcomp.Button primary xs 
                            onClick={props.addNewItem}
                            disabled={!props.newItem.ScientificName}
                        >{labels.General.add}</Xcomp.Button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>})

export default SpeciesSpeciesTable


