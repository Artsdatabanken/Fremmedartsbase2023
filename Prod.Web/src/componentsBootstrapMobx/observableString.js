import React from 'react'
import {PropTypes} from 'prop-types';
import {action} from 'mobx'
import {Observer} from 'mobx-react'
import {UserContext} from './components'
import auth from '../components/authService';

const ObservableString = (props) => <Observer>{() => {
    const context = UserContext.getContext()
    const {className, observableValue, label, placeholder, width, disabled, onFocus, maxlength} = props;
    const [obj, prop] = observableValue;
    const hasLabel = !!label;
    const style = width ? {widdth: width} : null
            // <FormControl type="text" className="form-control" name={prop}  value={obj[prop] || ""} onChange={action((e) => obj[prop] = e.currentTarget.value)} />
    //const value = obj[prop] === null ? "NotNill" : obj[prop]                 

    //console.log("obsstring: " + prop + " - " + typeof(obj[prop]) + "|" + obj[prop] +"#" + typeof(value) + "|'" + value + "'" ) 
    return(
        <div className={className}>
            {hasLabel ? <label htmlFor={prop}>{label}</label> : null}
            <input type="text" className="form-control" name={prop} value={obj && obj[prop] || ""} 
                onChange={action((e) => obj[prop] = e.currentTarget.value)} placeholder={placeholder}
                style={style}
                maxLength={maxlength}
                disabled={(context.readonly && !auth.isAdmin)|| disabled }
                onFocus = {onFocus}
            />
        </div>
    );
}}</Observer>


ObservableString.propTypes = {
	observableValue: PropTypes.array.isRequired,
}

export default ObservableString
