import React from 'react';
import {observable, action, makeObservable} from 'mobx';
import {observer} from 'mobx-react';
import NaturtypeRad from './naturtypeRad';


// const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

class NaturtypeTable extends React.Component {
    constructor(props) {
        super(props)

        makeObservable(this, {
            editMode: observable
        });
        this.editMode = false;
    }

    toggleEdit = action(() => {
        this.editMode = !this.editMode
    })
    render() {
        const {naturetypes, labels, canRenderTable, appState, desc, codes, disabled} = this.props;
        const ntLabels = labels.NatureTypes
        // check if there are any red list nature types in the table - they have only numbers in id's
        const reg = /^\d+$/;
        const noRedListTypes = !naturetypes.find(ntype => reg.test(ntype.niNCode))
                
        console.log("naturtyperader#: " + naturetypes.length)
        console.log("nt table: " + JSON.stringify(naturetypes))
        console.log("canRenderTable: " + canRenderTable)

        return(
            <div><p>{desc}</p>
            <table className="table naturetype">
            
            <colgroup>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "25%"}}/>                
                {/*!noRedListTypes && <col  style={{width: "15%"}}/> */}
                <col  style={{width: "10%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "5%"}}/>
            </colgroup>
            <thead>
                <tr>
                    <th>{ntLabels.code}</th>
                    <th>{ntLabels.name}</th>
                   {/* <th>{ntLabels.dominanceForrest}</th> */}
                    {!noRedListTypes && <th dangerouslySetInnerHTML={{__html: ntLabels.natureTypeArea}}></th>}
                    <th>{ntLabels.timeHorizon}</th>
                    <th>{ntLabels.colonizedArea}</th>
                    <th>{ntLabels.stateChange}</th>
                    <th>{ntLabels.affectedArea}</th>
                    <th>{ntLabels.assessmentBackgroundTable}</th>
                    <th>&nbsp;</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {canRenderTable ? naturetypes.map(nt => { 
                    const deleteRow = () => naturetypes.remove(nt)
                    
                    //const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea + nt.StateChange.join(';') + nt.AffectedArea
                    //const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea
                    console.log("nt row: " + JSON.stringify(nt))
                    const key = nt.niNCode+nt.timeHorizon
                    return <NaturtypeRad key={key} naturtype={nt} deleteRow={deleteRow} codes={codes} appState={appState} labels={labels} showNatureTypeArea={noRedListTypes != undefined && noRedListTypes != true} toggleEdit={this.toggleEdit} editMode={this.editMode} disabled={disabled}/> }) :
                    null
                }
            </tbody>
            </table>
            </div>
        )
    }
}

export default observer(NaturtypeTable);