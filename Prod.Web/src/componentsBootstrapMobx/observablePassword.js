import React from 'react';
import {PropTypes} from 'prop-types';
import {observer} from 'mobx-react';

@observer
export default class ObservablePassword extends React.Component {
    constructor() {
        super()
    }
    render() {
        const {observableValue, label} = this.props;
        const [obj, prop] = observableValue;
        const hasLabel = !!label;
        return(
            <input type="password" className="form-control" name={prop}  value={obj[prop] || ""}
                   disabled={this.context.readonly}
                   onChange={(e) => obj[prop] = e.currentTarget.value} />
        )
	}
}

ObservablePassword.contextTypes = {
    readonly: PropTypes.bool
}

ObservablePassword.propTypes = {
	observableValue: PropTypes.array.isRequired,
}
