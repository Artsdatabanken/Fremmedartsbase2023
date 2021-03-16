import React from 'react';
// import {action} from 'mobx';
// import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';


const nbsp = "\u00a0"


const OriginRow = (props) => 
    <tr>
        <td>{props.climateZoneLabel(props.item.ClimateZone)}</td>
        <td>{props.subClimateZoneLabel(props.item.ClimateZone)}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "Europe") ? null : <Xcomp.Bool observableValue={[props.item, 'Europe']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "Asia") ? null : <Xcomp.Bool observableValue={[props.item, 'Asia']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "Africa") ? null : <Xcomp.Bool observableValue={[props.item, 'Africa']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "Oceania") ? null : <Xcomp.Bool observableValue={[props.item, 'Oceania']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "NorthAndCentralAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'NorthAndCentralAmerica']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.ClimateZone, "SouthAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'SouthAmerica']} />}</td>
    </tr>


const OriginTable = (props) =>
    <table className="table table-striped" >
        <colgroup>
            <col className="col-md-1" />
            <col className="col-md-2" />
            <col className="col-md-1" />
            <col className="col-md-1" />
            <col className="col-md-1" />
            <col className="col-md-1" />
            <col className="col-md-1" />
            <col className="col-md-1" />
        </colgroup>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th>&nbsp;</th>
                <th>{props.labels.europe}</th>
                <th>{props.labels.asia}</th>
                <th>{props.labels.africa}</th>
                <th>{props.labels.oseania}</th>
                <th>{props.labels.northAndCentralAmerica}</th>
                <th>{props.labels.southAmerica}</th>
            </tr>
        </thead>
        <tbody>
            {props.origins.map(natOrigin => 
            <OriginRow 
                key={natOrigin.ClimateZone} 
                item={natOrigin} 
                climateZoneLabel={props.climateZoneLabel}
                subClimateZoneLabel={props.subClimateZoneLabel}
                naturalOriginDisabled={props.naturalOriginDisabled}
            />
            )}
        </tbody>
    </table>

export default OriginTable