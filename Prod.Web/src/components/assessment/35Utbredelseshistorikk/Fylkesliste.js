import React from 'react'
import {observer} from 'mobx-react'
import * as Xcomp from '../observableComponents'

@observer
export default class Fylkesliste extends React.Component {
    render() {
        const style = {
            th: {},
            th2: {
                textAlign: "mid",
                display: "inline-block",
                WebkitWritingMode: "vertical-rl",
                MsMritingMode: "tb-rl",
                writingMode: "vertical-rl",
                xtransformOrigin: "50% 50%",
                xtransform: "rotate(-270deg)"
            }
        }
        const {columns, rows, countyLabel} = this.props
        return (
            <table>
                <tbody>
                    <tr>
                        <td>
                            <table className="table-striped">
                                <thead>
                                    <tr>
                                        <th>{countyLabel || "Fylke"}</th>
                                        {columns.map(column => <th key={column.title} style={style.th}>{column.title}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(row => <Fylke key={row.key} row={row} columns={columns}/>)}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

Fylkesliste.propTypes = {
    columns: React
        .PropTypes
        .arrayOf(React.PropTypes.shape({title: React.PropTypes.string, values: React.PropTypes.object.isRequired}))
        .isRequired,
    rows: React
        .PropTypes
        .arrayOf(React.PropTypes.shape({key: React.PropTypes.string, title: React.PropTypes.string}))
        .isRequired
}

const Fylke = ({row, columns}) => <tr>
    <td>{row.title}</td>
    {columns.map(column => <td key={column.title} style={{
        textAlign: "center"
    }}>
        <Xcomp.Bool observableValue={[column.values, row.key]}/>
    </td>)}
</tr>