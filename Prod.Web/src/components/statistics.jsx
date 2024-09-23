import React from 'react';
import {observer} from 'mobx-react';
//import * as Xcomp from './observableComponents';
// import LoadingHoc from './LoadingHoc'
import {action, extendObservable} from "mobx"
import {loadData} from '../apiService';

@observer
export default class Statistics extends React.Component {
    constructor() {
        super()
        extendObservable(this, {
            statistikk: null,
            mode: "num"
        })
    }


    UNSAFE_componentWillMount() {
        // this.timerID = setTimeout(
        // () => this.statistikk = "Hallååå",
        // 5000
        // );
        loadData('ekspertgrupper/statistikk', data => {
            this.statistikk = data
        })
    }

    render() {
        const {appState} = this.props
        const labels = appState.codeLabels
        const columnWidth = (count, total) => this.mode === "num" ? 18 + (count / 3) : (800 / total) * count
        const culumnText = (count, total) => this.mode === "num" ? count : count === 0 ? "" : (Math.round((count/total) * 1000) / 10) + "%"
        return (
            <div>
                <h1>Statistikk</h1>
                <ul className="nav nav-pills">
                    <li role="presentation" className={this.mode === "num" ? "active" : ""}><a onClick={() => this.mode = "num"}>{labels.SelectAssessment.count}</a></li>
                    <li role="presentation" className={this.mode === "perc" ? "active" : ""}><a onClick={() => this.mode = "perc"}>{labels.SelectAssessment.percent}</a></li>
                    <li role="presentation" className={this.mode === "table" ? "active" : ""}><a onClick={() => this.mode = "table"}>{labels.SelectAssessment.table}</a></li>
                </ul>
                {this.mode == "table"
                ?   
                    <table className="table">
                        <colgroup>
                            <col style={{width: "180px"}} />
                            <col style={{width: "100px"}} />
                            <col style={{width: "100px"}} />
                            <col style={{width: "100px"}} />
                            <col style={{width: "120px"}} />
                            <col style={{width: "100px"}} />
                        </colgroup>

                        <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>{labels.SelectAssessment.notStarted}</th>
                                <th>{labels.SelectAssessment.started}</th>
                                <th>{labels.SelectAssessment.underWork}</th>
                                <th>{labels.SelectAssessment.completed}</th>
                                <th>{labels.SelectAssessment.total}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!this.statistikk ? null :
                                this.statistikk.map(group =>
                                    <tr key={group.Name} >
                                        <td>{group.Name}</td>
                                        <td>{group.UntouchedCount}</td>
                                        <td>{group.EditedButUnlockedCount}</td>
                                        <td>{group.LockedCount}</td>
                                        <td>{group.FinishedCount}</td>
                                        <td>{group.TotalCount}</td>
                                    </tr>)}
                        </tbody>
                    </table>


                : <div>
                    <br />

                    <div>
                        <div style={{display: "inline-block", width: "200px"}}>&nbsp;</div>
                        <div style={{display: "inline-block", width: "200px", backgroundColor: "#f2f2f2" }}>Ikke påbegynt</div>
                        <div style={{display: "inline-block", width: "200px", backgroundColor: "#e1e8ef" }}>Påbegynt</div>
                        <div style={{display: "inline-block", width: "200px", backgroundColor: "#b1c1cf" }}>Under arbeid</div>
                        <div style={{display: "inline-block", width: "200px", backgroundColor: "#6b7a8c" }}>Ferdigstilt</div>
                        {this.mode === "num" ? <div style={{display: "inline-block" }}>Totalt</div> : null }
                    </div>
                    <br />
                    <ul style={{listStyleType: "none", padding: "0"}}>
                    {!this.statistikk ? null :
                        this.statistikk.map(group =>
                            <li key={group.Name} >
                                <div style={{display: "inline-block", width: "200px" }}><span>{group.Name}</span></div>
                                <div style={{display: "inline-block", width: columnWidth(group.UntouchedCount, group.TotalCount), backgroundColor: "#f2f2f2" }}>{culumnText(group.UntouchedCount, group.TotalCount)}</div>
                                <div style={{display: "inline-block", width: columnWidth(group.EditedButUnlockedCount, group.TotalCount), backgroundColor: "#e1e8ef" }}>{culumnText(group.EditedButUnlockedCount, group.TotalCount)}</div>
                                <div style={{display: "inline-block", width: columnWidth(group.LockedCount, group.TotalCount), backgroundColor: "#b1c1cf" }}>{culumnText(group.LockedCount, group.TotalCount)}</div>
                                <div style={{display: "inline-block", width: columnWidth(group.FinishedCount, group.TotalCount), backgroundColor: "#6b7a8c" }}>{culumnText(group.FinishedCount, group.TotalCount)}</div>
                                {this.mode === "num" ? <div style={{display: "inline-block" }}>{group.TotalCount}</div> : null}
                            </li>
                        )

                    }
                    </ul>
                </div> }
            </div>
        )
    }
}

