import React from 'react'
import {PropTypes} from 'prop-types'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import {UserContext} from './components'



@observer
export default class ObservableStringCombobox extends React.Component {
    constructor(props) {
        super(props)
        // this.expanded = observable(false)
        extendObservable(this, {
            expanded: false
        })
    }
    render() {
        const context = UserContext.getContext()
        const {observableValue, selectableValues} = this.props;
        const [obj, prop] = observableValue;
        const nbsp = "\u00a0"
        return(
            <div className={"dropdown input-group" + (this.expanded ? " open" : "")} >
                <input type="text" className="form-control" name={prop}  value={obj[prop] || ""} onChange={(e) => obj[prop] = e.currentTarget.value}/>
                <ul role="menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="input-dropdown-addon">
                {selectableValues.map((d) =><li role="presentation" key={"val" + d}><a role="menuitem" onClick={() => {obj[prop] = d === nbsp ? "" : d; this.expanded = false}}>{d}</a></li>)}
                </ul>
                <span className="input-group-btn">
                    <button id="input-dropdown-addon" role="button" aria-haspopup="true" aria-expanded={this.expanded} type="button" onClick={() => this.expanded = !this.expanded}
                            disabled={context.readonly}
                            className="dropdown-toggle btn btn-default">
                        {/*<span className="caret"></span>*/}
                    </button>
                </span>
            </div>
        )
	}
}

// ObservableStringCombobox.contextTypes = {
//     readonly: PropTypes.bool
// }

ObservableStringCombobox.propTypes = {
    observableValue: PropTypes.array.isRequired, // [obj, propname]
    selectableValues: PropTypes.array.isRequired,
}
