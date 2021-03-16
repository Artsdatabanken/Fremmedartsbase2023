import React from 'react';
import {PropTypes} from 'prop-types';
import {action, runInAction, useStrict} from 'mobx';
import {observer, Observer} from 'mobx-react';
import {UserContext} from './components'

export const Radio = (props) => <Observer>{() => {
    const context = UserContext.getContext()

        const value = props.value || props.kode.Value || props.kode.value 
        const label = props.label || props.kode.Text || props.kode.text 
        const [obj, prop] = props.observableValue;
        const criteria = props.criteria;
        const disabled = props.disabled || context.readonly
        const className = props.className
        const defaultChecked = props.defaultChecked || obj[prop] === value
        //console.log(">" + prop + " (" + obj[prop] + ") " + value)
        return <div className={"radio " + className} key={value}>
            <label className={props.disabled ? "disabled" : ""}><input type="radio" name={"radio " + criteria+prop} value={value}
                                                                    defaultChecked={defaultChecked}
                                                                       disabled={disabled}
                                                                       onClick={action(e => obj[prop] = e.target.value )}
                                                                      />{label}
            </label>
        </div>
    
}}</Observer>

const ObservableStringEnum = (props) => <Observer>{() => {
    const context = UserContext.getContext()
    //Note that radiobuttons requires unique 'name'. suply name prop if the object-'prop' is not unique
    const {className, observableValue, codes, label, mode, name, forceSync, placeholder, disabled} = props;
    const [obj, prop] = observableValue;
    if (obj[prop] === undefined) {
        console.error("ObservableStringEnum " + prop + " is undefined")
    }
    if (codes === undefined) {
        console.error("ObservableStringEnum " + prop + " misses codes")
    }
    if (forceSync) {
        // force the observableValue to have a value that exists in the codes list
        // typically used to set initial value for property (so that it is not null)
        // - the problem it solves is that ObservableStringEnum does not set the value before something is actively selected
        const existingCode = codes.find(kode => kode.value === obj[prop])
        if (existingCode === undefined ) {
            runInAction(() => obj[prop] = codes[0].value)
        }
    }

    const hasLabel = !!label;
    

    //console.log("prop:" + prop + " value: " + obj[prop] )

    if (!codes) {
        console.log("codes missing for " + prop)
    }
    return (
        mode === 'radio' ?
            <div className={className}>
                {hasLabel ? <label key="radiolabel" htmlFor={prop}>{label}</label> : null}
                {codes.map((kode) => <Radio kode={kode} key={kode.value || kode.Value}
                                            observableValue={observableValue}
                                            defaultChecked ={obj[prop] === kode.value || obj[prop] === kode.Value}
                                            id={prop} 
                                            name={name}/>)}
            </div>
            : mode === 'radiohorizontal' ?
            <div className="radiohorizontal">
                {hasLabel ? <label key="radiolabel" htmlFor={prop}>{label}</label> : null}
                {codes.map((kode) => <Radio kode={kode} key={kode.value || kode.Value}
                                            observableValue={observableValue}
                                            id={prop} 
                                            defaultChecked = {false}
                                            name={prop} disabled={disabled} />)}                                               
            </div>                
            :
            <div>
                {hasLabel ? <label htmlFor={prop}>{label}</label> : null}
                <select className="form-control" 
                        // multiple={true} 
                        placeholder={placeholder ? placeholder : "select"} 
                        id={prop} 
                        name={prop} 
                        value={obj[prop] || ""}
                        onChange={action(e => obj[prop] = e.target.value)}
                        disabled={context.readonly || disabled}>
                    { codes.map((kode) => <option value={kode.value || kode.Value}
                                                    key={kode.value || kode.Value || kode.text || kode.Text || "null"}>{kode.text || kode.Text}</option>)}
                </select>
            </div>
    );
}}</Observer>

// ObservableStringEnum.contextTypes = {
//     readonly: PropTypes.bool
// }

ObservableStringEnum.propTypes = {
    observableValue: PropTypes.array.isRequired, // [obj, propname]
    //codes: React.PropTypes.array.isRequired,
}

export default ObservableStringEnum
