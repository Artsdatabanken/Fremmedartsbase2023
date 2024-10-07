import React from 'react';
import * as Xcomp from '../observableComponents';
import { extendObservable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import NaturtypeModal from './naturetypeModal';
import redListCodes from '../../../TrueteOgSjeldneNaturtyper2018.json';


export class NaturtypeRad extends React.Component {
    constructor(props) {
        super()
        const { naturtype, appState, deleteRow } = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false,
            edit: props.editMode,
        })
        this.updateNaturetype = action((upd) => {
            const nt = naturtype
            nt.dominanceForrest.replace(upd.dominanceForrest)
            nt.timeHorizon = upd.timeHorizon
            nt.colonizedArea = upd.colonizedArea
            nt.stateChange.replace(upd.stateChange)
            nt.affectedArea = upd.affectedArea
            if (upd.natureTypeArea > 0) {
                nt.natureTypeArea = upd.natureTypeArea
            }
            else {
                nt.natureTypeArea = null
            }
            nt.natureTypeArea = upd.natureTypeArea
            nt.background = upd.background
            this.showModal = false

        })
    }
    render() {
        const { naturtype, appState, deleteRow, labels, disabled, codes, toggleEdit, showNatureTypeArea, editMode, appState: { assessment } } = this.props;
        // const natureTypeCodes = require('./../../../Nin2_3.json')
        // const riskAssessment = assessment.riskAssessment
        const gLabels = labels.General
        const nt = naturtype
        // const ntlabel = nt.niNVariation
        const koder = codes
        // const dominanceForrest = nt.DominanceForrest
        const timeHorizonLabel = (id) => codes.timeHorizon.find(code => code.Value === id).Text
        const colonizedAreaLabel = (id) => codes.colonizedArea.find(code => code.Value === id).Text
        // const stateChangeLabel = (id) => codes.tilstandsendringer.find(code => code.Value === id).Text
        const affectedAreaLabel = (id) => codes.affectedArea.find(code => code.Value === id).Text
        // regular expression to check that the id does not contain only numbers
        const reg = /^\d+$/;

        const findNTArea = (id) => {
            var area = "";
            if (id) {
                if (reg.test(id)) {
                    for (var i = 0; i < redListCodes.Children.length; i++) {
                        for (var j = 0; j < redListCodes.Children[i].Children.length; j++) {
                            if (redListCodes.Children[i].Children[j].Id == id) {
                                area = redListCodes.Children[i].Children[j].Area
                            }
                        }
                    }
                }
            }
            return area == 0 ? "" : area
        }
        return (
            <tr>
                <td>{isNaN(nt.niNCode) ? nt.niNCode : ""}</td>
                <td>{nt.name ? nt.name : ""}</td>
                {showNatureTypeArea && <td>{nt.niNCode ? findNTArea(nt.niNCode) : ""}</td>}
                {this.edit
                    ?
                    <td>{(assessment.isDoorKnocker && assessment.speciesStatus == "A") ? koder.timeHorizon[1].Text :
                        <Xcomp.StringEnum observableValue={[nt, 'timeHorizon']} forceSync codes={koder.timeHorizon} />
                    }</td>
                    :
                    <td>
                        {timeHorizonLabel(nt.timeHorizon)}
                    </td>}
                {this.edit
                    ? <td>
                        {
                            <Xcomp.StringEnum observableValue={[nt, 'colonizedArea']} forceSync codes={koder.colonizedArea} />
                        }
                    </td>
                    : <td>
                        {colonizedAreaLabel(nt.colonizedArea)}
                    </td>}
                {this.edit
                    ? <td>
                        <Xcomp.MultiselectArray
                            observableValue={[nt, 'stateChange']}
                            codes={koder.tilstandsendringer}
                            disabled={disabled}
                            //mode="check"
                            hideUnchecked />
                    </td>
                    : <td>
                        {nt.stateChange.length > 0
                            ? <Xcomp.MultiselectArray
                                observableValue={[nt, 'stateChange']}
                                codes={koder.tilstandsendringer}
                                disabled={true}
                                mode="check"
                                hideUnchecked /> : "Ingen valgt"}
                    </td>}
                {this.edit
                    ? <td>{
                        <Xcomp.StringEnum observableValue={[nt, 'affectedArea']} forceSync codes={koder.affectedArea} />
                    }
                    </td>
                    : <td>
                        {affectedAreaLabel(nt.affectedArea)}
                    </td>}
                {this.edit
                    ? <td>
                        <Xcomp.MultiselectArray
                            observableValue={[nt, 'background']}
                            codes={koder.assessmentBackgrounds}
                            //mode="check"
                            disabled={disabled}
                            hideUnchecked />
                    </td>
                    : <td>
                        {nt.background.length > 0 ?
                            <Xcomp.MultiselectArray
                                observableValue={[nt, 'background']}
                                codes={koder.assessmentBackgrounds}
                                mode="check"
                                disabled={true}
                                hideUnchecked /> : "Ingen valgt"}
                    </td>}
                <td>
                    {this.showModal
                        ? <NaturtypeModal
                            naturtype={nt}
                            assessment={assessment}
                            showModal={[this, "showModal"]}
                            hideStateChange={[this, "hideStateChange"]}
                            onOk={this.updateNaturetype}
                            appState={appState}
                            labels={labels} />
                        : null}
                    {!disabled &&
                        <>
                            <Xcomp.Button
                                disabled={this.context.readonly}
                                xs
                                title={!this.edit
                                    ? labels.General.edit
                                    : labels.General.ok}
                                onClick={action(() => { this.edit = !this.edit; toggleEdit() })}
                            >
                                {this.edit
                                    ? labels.General.ok
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                    </svg>}
                            </Xcomp.Button>
                            <Xcomp.Button xs onClick={deleteRow} title={gLabels.delete}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                </svg>
                            </Xcomp.Button></>}
                </td>
                <td>&nbsp;</td>
            </tr>
        );
    }
}

export default inject("appState")(observer(NaturtypeRad));
