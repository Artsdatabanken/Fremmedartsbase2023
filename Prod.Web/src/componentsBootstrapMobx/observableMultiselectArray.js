import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';
import {action, extendObservable} from 'mobx';
import {observer} from 'mobx-react';
import {UserContext} from './components'

@observer
export class ObservableMultiselectArrayCheckboxes extends React.Component {
    render() {
        const {observableValue, codes, className, disabled, hideUnchecked} = this.props;
        const [obj, prop] = observableValue;
        const context = UserContext.getContext()
        if(obj[prop] === undefined) {
            console.log("ObservableMultiselectArrayCheckboxes - prop:" + prop + " is undefined!")
        }
        if(obj[prop] === null) {
            console.log("ObservableMultiselectArrayCheckboxes - prop:" + prop + " is null! It has to be an array")
        }
        if(!codes) {
            console.log("ObservableMultiselectArrayCheckboxes - prop:" + prop + " no codes")
        }
        return(
            <ul className={className ? className : "" }  >
                {codes.map(code => 
                <li className="checkbox" key={code.value} style={(hideUnchecked && obj[prop].indexOf(code.value) < 0) ? {display: 'none'} : {display: 'block'}} >
                    <label style={{cursor: 'pointer'}}>
                        <input type="checkbox" label={code.text} checked={obj[prop].indexOf(code.value) !== -1} style={{cursor: 'pointer'}}
                            disabled={disabled}
                            //disabled={disabled || context.readonly}
                            onChange={action(e => {
                            // e.nativeEvent.stopImmediatePropagation()
                            if(e.target.checked) {
                                if(obj[prop].indexOf(code.value) === -1) {obj[prop].push(code.value)}} 
                            else {obj[prop].remove(code.value)}
                            // e.nativeEvent.stopImmediatePropagation()
                            })}
                         />{code.text}
                    </label>
                </li>)}
            </ul>
        )
    }
}



@observer
export class ObservableMultiselectArrayDropdown extends React.Component {
    constructor() {
        super()
        extendObservable(this, {
            open: false,
        })
        // autorun(() => {
        //     console.log(`side: ${  this.side}`)
        // })

    }

    render() {
        const {observableValue, codes, labels, heading, hideUnchecked} = this.props;
        const [obj, prop] = observableValue;

        // console.log("------------" + JSON.stringify(labels))

        const maxListableElements = 4
        const noneSelectedLabel = labels && labels.noneSelected ? labels.noneSelected : heading ? heading : "Ingen valgt"
        const multipleSelectedLabel = labels && labels.multipleSelected ? labels.multipleSelected : heading ? heading : "Flere valgt"

        const names = codes.filter(code => obj[prop].indexOf(code.value) > -1).map(code => code.text)
        const buttonText = names.length === 0 ? noneSelectedLabel : names.length > maxListableElements ? multipleSelectedLabel + " (" + names.length + ")" : names.join(', ') 
        return(
            <div className={"btn-group" + (this.open ? " open" : "")}>
                <button type="button" className="multiselect btn btn-default" title={"Velg"} onClick={() => this.open = !this.open} >
                    {(!hideUnchecked || names.length === 0 )? 
                        <span className="multiselect-selected-text">{buttonText}</span> : <span className="multiselect-selected-text">{"Endre valg"}</span>} 
                    <b className="caret"></b>
                </button>
                <div className="dropdown-menu">
                    <div className="modal-backdrop" style={{zIndex: "1210", opacity: "0.00001"}} onClick={() => this.open = false }> </div>
                    <div style={{position: "relative", zIndex: "1220" }}>
                        <div style={{marginLeft: "5px", marginRight: "10px"}}>                        
                            <ObservableMultiselectArrayCheckboxes observableValue={observableValue} codes={codes} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

@observer
export default class ObservableMultiselectArray extends React.Component {
    constructor(props) {
        super(props);
//        this.prop = prop
            
    }
    UNSAFE_componentWillMount() {
        const {observableValue, codes} = this.props;
        // this.selectHelper = multipleSelectHelper(prop, obj[prop] , codes, this.context.readonly)
    }
    render() {
        const {observableValue, className, codes, label, labels, mode, formlayout, disabled, heading, hideUnchecked} = this.props;
        const [obj, prop] = observableValue;
        const hasLabel = !!label;
        //console.log("////" + prop +"-" + mode)
        return(
            mode === "check" ?
            <ObservableMultiselectArrayCheckboxes observableValue={observableValue} codes={codes} disabled={disabled} className={hideUnchecked ? "magicList" : className} hideUnchecked={hideUnchecked} />
            :
            hasLabel ?
            <div className="hasLabel">
                <label htmlFor={prop}>{label}
                    {formlayout ? <br /> : null}
                    <ObservableMultiselectArrayDropdown observableValue={observableValue} codes={codes} disabled={disabled} labels={labels} />
                </label>
            </div> :
            <ObservableMultiselectArrayDropdown observableValue={observableValue} heading={heading} hideUnchecked={hideUnchecked} disabled={disabled} codes={codes} labels={labels} />
        );
	}
}

ObservableMultiselectArray.contextTypes = {
    readonly: PropTypes.bool
}

ObservableMultiselectArray.propTypes = {
    observableValue: PropTypes.array.isRequired
}
