
import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const HostParasiteTable = observer((props) => 
{
    const labels = props.labels
    return <table className="table">
        <colgroup>
            <col style={{width: "30%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "25%"}} />
            <col style={{width: "10%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
            <col style={{width: "5%"}} />
        </colgroup>
        <thead>
            <tr>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localSpecie}}></th>
                {props.showKeyStoneSpecie ? <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.keystoneSpecies}}></th> : null}
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteScientificname}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteEcoEffect}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.localScale}} ></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteNew}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.parasiteAlien}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.diseaseDocumented}}></th>
                <th dangerouslySetInnerHTML={{ __html: labels.DEcrit.domesticOrAbroad}} ></th>
                <th>&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {props.list.map(item =>
            <tr key={
                item.ScientificName+
                item.KeyStoneSpecie+
                item.ParasiteScientificName+
                item.ParasiteEcoEffect+
                item.EffectLocalScale+
                item.ParasiteNewForHost+
                item.ParasiteIsAlien+
                item.DiseaseConfirmedOrAssumed+
                item.DomesticOrAbroad
                }>
                <td>
                    <div className="speciesItem">
                        <div className={"rlCategory " + item.RedListCategory}>{item.RedListCategory}</div>
                        <div className="vernacularName">{item.VernacularName}</div>
                        <div className="scientificName">{item.ScientificName}</div>
                        <div className="author">{"(" + item.ScientificNameAuthor + ")"}</div>
                    </div>
                </td>
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[item, 'KeyStoneSpecie']} /></td> : null}
                <td>{item.ParasiteScientificName}</td>
                <td><Xcomp.StringEnum observableValue={[item, 'ParasiteEcoEffect']} forceSync codes={props.koder.ParasiteEcoEffectCodes} /></td>
                <td><Xcomp.Bool observableValue={[item, 'EffectLocalScale']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'ParasiteNewForHost']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'ParasiteIsAlien']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'DiseaseConfirmedOrAssumed']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'DomesticOrAbroad']} stringBool="True,False" /></td>

                <td><Xcomp.Button primary xs onClick={() => props.list.remove(item) }>{labels.General.delete}</Xcomp.Button></td>
            </tr>
            )}
            <tr className="newRow">
                <td>
                    <div style={{position: 'relative'}}>
                        {props.newItem.ScientificName.length > 0 ?
                        <div 
                            className="speciesNewItem"
                            onClick={action(() => {
                                props.newItem.TaxonId = "";
                                props.newItem.TaxonRank = "";
                                props.newItem.ScientificName = "";
                                props.newItem.ScientificNameId = "";
                                props.newItem.ScientificNameAuthor = "";
                                props.newItem.VernacularName = "";
                                props.newItem.RedListCategory = "";
                                props.newItem.taxonSearchResult.replace([]); 
                                props.newItem.taxonSearchString = "" }) 
                            }
                        >
                            <div className={"rlCategory " + props.newItem.RedListCategory}>{props.newItem.RedListCategory}</div>
                            <div className="vernacularName">{props.newItem.VernacularName}</div>
                            <div className="scientificName">{props.newItem.ScientificName}</div>
                            <div className="author">{"(" + props.newItem.ScientificNameAuthor + ")"}</div>
                        </div> :
                        <Xcomp.String observableValue={[props.newItem, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />}
                        {props.newItem.taxonSearchResult.length > 0 ?
                        <div className="speciesSearchList" style={{position: 'absolute', top: "36px", left:"15px"}}>
                            <ul className="panel list-unstyled">
                            {props.newItem.taxonSearchResult.map(item =>
                                <li onClick={action(e => {
                                    props.newItem.TaxonId = item.taxonId;
                                    props.newItem.TaxonRank = item.taxonRank;
                                    props.newItem.ScientificName = item.scientificName;
                                    props.newItem.ScientificNameId = item.scientificNameId;
                                    props.newItem.ScientificNameAuthor = item.author;
                                    props.newItem.VernacularName = item.popularName;
                                    props.newItem.RedListCategory = item.rlCategory;
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
                {props.showRedlist ? <td><Xcomp.String observableValue={[props.newItem, 'RedListCategory']} /></td> : null}
                {props.showKeyStoneSpecie ? <td><Xcomp.Bool observableValue={[props.newItem, 'KeyStoneSpecie']} /></td> : null}
                <td><Xcomp.String observableValue={[props.newItem, 'ParasiteScientificName']} /></td>
                <td><Xcomp.StringEnum observableValue={[props.newItem, 'ParasiteEcoEffect']} forceSync codes={props.koder.ParasiteEcoEffectCodes} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'EffectLocalScale']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'ParasiteNewForHost']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'ParasiteIsAlien']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'DiseaseConfirmedOrAssumed']} /></td>
                <td><Xcomp.Bool observableValue={[props.newItem, 'DomesticOrAbroad']} stringBool="True,False" /></td>
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