import React from 'react';
import {PropTypes} from 'prop-types';
import {Observer} from 'mobx-react';
import {action} from 'mobx';
import {UserContext} from './components'

const ObservableBool = (props) => <Observer>{() => {
    const context = UserContext.getContext()
    const {observableValue, label, label2, stringBool, disabled, mode} = props;
    const [obj, prop] = observableValue;
    
    // eg: stringBool="True,False" (or "Yes,No...") (not for radio!)
    const flagStrings = !stringBool ? [] : stringBool.split(',');
    const isStringBool = flagStrings.length === 2

    const hasLabel = !!label;
    const labelB1 = (mode === 'radio' && !label) ? "true" : label
    const labelB2 = (mode === 'radio' && !label2) ? "false" : label2

    return (
        mode === "radio"
        ? <div className={"radiobool"}>
            <div className={"radiobooltrue"} key={"true"}>
                <label className={props.disabled ? "disabled" : ""}>
                    <input type="radio" name={"radio " + prop} value={value}
                        disabled={disabled}
                        onClick={action(e => obj[prop] = true )}
                        />{labelB1}
                </label>
            </div>
            <div className={"radioboolfalse"} key={"false"}>
                <label className={props.disabled ? "disabled" : ""}>
                    <input type="radio" name={"radio " + prop} value={value}
                        disabled={disabled}
                        onClick={action(e => obj[prop] = false )}
                        />{labelB2}
                </label>
            </div>
          </div>

        : hasLabel
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
