import React from 'react';
import {PropTypes} from 'prop-types';
import {Observer} from 'mobx-react';
import {action} from 'mobx';
import {UserContext} from './components'

const ObservableBool = (props) => <Observer>{() => {
    const context = UserContext.getContext()
    const {observableValue, label, stringBool, disabled} = props;
    const [obj,
        prop] = observableValue;
    
    // eg: stringBool="True,False" (or "Yes,No...")
    const flagStrings = !stringBool ? [] : stringBool.split(',');
    const isStringBool = flagStrings.length === 2

    const hasLabel = !!label;
    return (hasLabel
        ? <div className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={isStringBool ? obj[prop] === flagStrings[0] : !!obj[prop]}
                        style={{cursor: 'pointer'}}
                        disabled={context.readonly || disabled}
                        onChange={action(e => {
                            obj[prop] = isStringBool 
                                ? e.target.checked 
                                    ? flagStrings[0] 
                                    : flagStrings[1] 
                                : e.target.checked;
                            })}
                    /> {label}
                </label>
            </div>
        : <input
            type="checkbox"
            checked={isStringBool ? obj[prop] === flagStrings[0] : !!obj[prop]}
            disabled={context.readonly || disabled}
            onChange={action(e => {
                obj[prop] = isStringBool 
                    ? e.target.checked 
                        ? flagStrings[0] 
                        : flagStrings[1] 
                    : e.target.checked;
                })}
        />)
    
}}</Observer>

ObservableBool.propTypes = {
    observableValue: PropTypes.array.isRequired
}

export default ObservableBool
