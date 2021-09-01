import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

const SpeciesNaturetypeTable = observer((props) => 
{
    const labels = props.labels
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
            <tr key={item.niNCode+item.Effect+item.InteractionType+item.KeyStoneSpecie+item.EffectLocalScale}>
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
                                //heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[item, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked
                                />
                    {/*<Xcomp.Bool observableValue={[item, 'longDistanceEffect']} />*/}
                    
                 </td>
                {/*<td><Xcomp.Bool observableValue={[item, 'confirmedOrAssumed']} /></td>
                <td><Xcomp.Bool observableValue={[item, 'domesticOrAbroad']} stringBool="True,False" /></td>*/}
                <td><Xcomp.Button primary xs onClick={() => props.list.remove(item) }>{labels.General.delete}</Xcomp.Button></td>
            </tr>
            )}
            <tr className="newRow">
                <td>
                    <select className="form-control" placeholder="velg naturtype" value={props.newItem.niNCode}
                            onChange={action(e => props.newItem.niNCode = e.target.value)}
                            >

                        {/*//todo: uncomment this when we have naturetypeLabels
                         { props.newItem.naturetypes.map(nt => {
                            const ninlabel = props.naturtypeLabels ? props.naturtypeLabels[nt.niNCode] : ""
                            const label = nt.niNCode + " " + ninlabel
                            return <option value={nt.niNCode} key={nt.niNCode}>{label}</option>})} */}
                    </select>

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
                                //heading={labels.DEcrit.assessmentBasis}
                                //mode="check"
                                />
                <Xcomp.MultiselectArray
                                observableValue={[props.newItem, 'basisOfAssessment']} 
                                codes={props.koder.assessmentBackgrounds}
                                mode="check"
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
                            disabled={!props.newItem.niNCode}
                        >{labels.General.add}</Xcomp.Button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>})

export default SpeciesNaturetypeTable


