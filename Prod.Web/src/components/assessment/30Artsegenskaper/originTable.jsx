import React from 'react';
import * as Xcomp from '../../observableComponents';
const nbsp = "\u00a0"
const OriginRow = (props) =>
    !props.mode ? 
        <tr>
            <td>{props.climateZoneLabel(props.item.climateZone)}</td>
            <td>{props.subClimateZoneLabel(props.item.climateZone)}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "Europe") ? null : <Xcomp.Bool observableValue={[props.item, 'europe']} />}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "Asia") ? null : <Xcomp.Bool observableValue={[props.item, 'asia']} />}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "Africa") ? null : <Xcomp.Bool observableValue={[props.item, 'africa']} />}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "Oceania") ? null : <Xcomp.Bool observableValue={[props.item, 'oceania']} />}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "NorthAndCentralAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'northAndCentralAmerica']} />}</td>
            <td>{props.naturalOriginDisabled(props.item.climateZone, "SouthAmerica") ? null : <Xcomp.Bool observableValue={[props.item, 'southAmerica']} />}</td>
        </tr>
    :
    props.mode == "marine" ? 
    <tr>
        <td>{props.climateZoneLabel(props.item.climateZone)}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "None") ? null : <Xcomp.Bool observableValue={[props.item, 'none']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "OpenCoastLine") ? null : <Xcomp.Bool observableValue={[props.item, 'openCoastLine']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "Skagerrak") ? null : <Xcomp.Bool observableValue={[props.item, 'skagerrak']} />}</td>
    </tr>
    : 
    props.mode == "continental" ? 
    <tr>
        <td>{props.climateZoneLabel(props.item.climateZone)}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "StrongOceanic") ? null : <Xcomp.Bool observableValue={[props.item, 'strongOceanic']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "ClearOceanic") ? null : <Xcomp.Bool observableValue={[props.item, 'clearOceanic']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "WeakOceanic") ? null : <Xcomp.Bool observableValue={[props.item, 'weakOceanic']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "TransferSection") ? null : <Xcomp.Bool observableValue={[props.item, 'transferSection']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "WeakContinental") ? null : <Xcomp.Bool observableValue={[props.item, 'weakContinental']} />}</td>
    </tr>
    : 
    props.mode == "arctic" ? 
    <tr>
        <td>{props.climateZoneLabel(props.item.climateZone)}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "WeakOceanic") ? null : <Xcomp.Bool observableValue={[props.item, 'weakOceanic']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "TransferSection") ? null : <Xcomp.Bool observableValue={[props.item, 'transferSection']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "WeakContinental") ? null : <Xcomp.Bool observableValue={[props.item, 'weakContinental']} />}</td>
        <td>{props.naturalOriginDisabled(props.item.climateZone, "ClearContinental") ? null : <Xcomp.Bool observableValue={[props.item, 'clearContinental']} />}</td>
    </tr> : null

const OriginTable = (props) =>
    <table className="table table-striped" >
        {props.mode ?
        
        props.mode == "marine" ? 
        <>
            <colgroup>
            <col className="col-md-5" />
            <col className="col-md-2" />
            <col className="col-md-2" /> 
            <col className="col-md-2" />
        </colgroup>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th>{props.labels.none}</th>
                <th>{props.labels.openCoastLine}</th>
                <th>{props.labels.skagerrak}</th>
            </tr>
        </thead>
        </> :
        props.mode == "continental" ? 
        <>
        <colgroup>
            <col className="col-md-1" />
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-3" />
        </colgroup>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th>{props.labels.strongOceanic}</th>
                <th>{props.labels.clearOceanic}</th>
                <th>{props.labels.weakOceanic}</th>
                <th>{props.labels.transferSection}</th>
                <th>{props.labels.weakContinental}</th>
            </tr>
        </thead>
        </> :
        props.mode == "arctic" ? 
        <>
        <colgroup>
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-2" />
            <col className="col-md-2" />
        </colgroup>
        <thead>
            <tr>
                <th>&nbsp;</th>
                <th>{props.labels.weakOceanic}</th>
                <th>{props.labels.transferSection}</th>
                <th>{props.labels.weakContinental}</th>
                <th>{props.labels.clearContinental}</th>
            </tr>
        </thead>
        </> : null :
        <>
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
        </>
        }
        <tbody>
            {props.origins.map(natOrigin => 
            <OriginRow 
                key={natOrigin.climateZone} 
                item={natOrigin} 
                mode = {props.mode ? props.mode : null}
                climateZoneLabel={props.climateZoneLabel}
                subClimateZoneLabel={props.subClimateZoneLabel}
                naturalOriginDisabled={props.naturalOriginDisabled}
            />
            )}
        </tbody>
    </table>

export default OriginTable