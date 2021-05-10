import React from 'react';
import config from '../../../config';
import * as Xcomp from '../observableComponents';

const ObservedAndEstablishedRow = (props) => 
    <tr>
        <td>{props.label}</td>
        <td><Xcomp.String observableValue={[props.item.ObservedInCountry, 'Time']} /></td>
        <td><Xcomp.String observableValue={[props.item.ObservedInCountry, 'Place']} /></td>
        <td><Xcomp.String observableValue={[props.item.FertileSpecimenObserved, 'Time']} /></td>
        <td><Xcomp.String observableValue={[props.item.FertileSpecimenObserved, 'Place']} /></td>
        <td><Xcomp.String observableValue={[props.item.Established, 'Time']} /></td>
        <td><Xcomp.String observableValue={[props.item.Established, 'Place']} /></td>
        <td><Xcomp.String observableValue={[props.item.Population, 'Time']} /></td>
        <td><Xcomp.String observableValue={[props.item.Population, 'Place']} /></td>
        {props.showIndividualCount ? <td><Xcomp.StringEnum observableValue={[props.item, 'SpecimenCount']} codes={props.koder.firstObservationIndividualCount} /></td> : null}
    </tr>

const DomesticObservedAndEstablished = (props) => {
    const lw = "17%"
    const yw = "7%"
    const pw = "14%"
    return <table className="formtable" >
        <colgroup>
            <col style={{width: lw}} />
            <col style={{width: yw}} />
            <col style={{width: pw}} />
            <col style={{width: yw}} />
            <col style={{width: pw}} />
            <col style={{width: yw}} />
            <col style={{width: pw}} />
            <col style={{width: yw}} />
            <col style={{width: pw}} />
            {props.showIndividualCount ? <col style={{width: lw}} /> : null}
        </colgroup>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th colSpan="2">{props.labels.nonReproductive}</th>
                <th colSpan="2">{props.labels.reproduktive}</th>
                <th colSpan="2">{props.labels.viableOffspring}</th>
                <th colSpan="2">{props.labels.population}</th>
            </tr>
            <tr>
                <th>&nbsp;</th>
                <th>{props.labels.year}</th>
                <th>{props.labels.place}</th>
                <th>{props.labels.year}</th>
                <th>{props.labels.place}</th>
                <th>{props.labels.year}</th>
                <th>{props.labels.place}</th>
                <th>{props.labels.year}</th>
                <th>{props.labels.place}</th>
                {props.showIndividualCount ? <th>{props.labels.individualCount}</th> : null }
            </tr>
        </thead>
        <tbody>
            <ObservedAndEstablishedRow label={props.labels.indoor} item={props.observedAndEstablishedStatusInNorway.indoor} koder={props.koder}  showIndividualCount={props.showIndividualCount}/>
            <ObservedAndEstablishedRow label={props.labels.outdoor} item={props.observedAndEstablishedStatusInNorway.productionArea} koder={props.koder}  showIndividualCount={props.showIndividualCount}/>
            <ObservedAndEstablishedRow label={props.labels.domesticNature} item={props.observedAndEstablishedStatusInNorway.norwegianNature} koder={props.koder} showIndividualCount={props.showIndividualCount}/>
        </tbody>
    </table>}

export default DomesticObservedAndEstablished
