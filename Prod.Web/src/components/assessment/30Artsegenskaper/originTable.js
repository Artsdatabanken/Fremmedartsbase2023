import React from 'react';
// import {action} from 'mobx';
// import {observer} from 'mobx-react';
import * as Xcomp from '../../observableComponents';


const nbsp = "\u00a0"


const OriginRow = (props) => 
    <tr>
        <td>{props.climateZoneLabel(props.item.climateZone)}</td>
        <td>{props.subClimateZoneLabel(props.item.climateZone)}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "europe") ? null : <Xcomp.Bool observableValue={[props.item, 'europe']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "asia") ? null : <Xcomp.Bool observableValue={[props.item, 'asia']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "africa") ? null : <Xcomp.Bool observableValue={[props.item, 'africa']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "oceania") ? null : <Xcomp.Bool observableValue={[props.item, 'oceania']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "northAndCentralAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'northAndCentralAmerica']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "southAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'southAmerica']} />}</td>
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
                key={natOrigin.climateZone} 
                item={natOrigin} 
                climateZoneLabel={props.climateZoneLabel}
                subClimateZoneLabel={props.subClimateZoneLabel}
                naturalOriginDisabled={props.naturalOriginDisabled}
            />
            )}
        </tbody>
    </table>

export default OriginTable