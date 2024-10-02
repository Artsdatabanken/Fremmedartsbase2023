import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';
import {action, extendObservable} from 'mobx';
import {Observer, observer} from 'mobx-react';
import {UserContext} from './components'


export const ObservableMultiselectArrayCheckboxes = (props) => <Observer> {() => {
        const {observableValue, codes, className, disabled, hideUnchecked, facetFunction, facets, facet, totalCount} = props;
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
                         />{code.text + (facetFunction ? facet =="Progress" ? (' (' + facetFunction(facets,facet,code.id) + ') ' + (100*facetFunction(facets,facet,code.id) /totalCount).toFixed() + "%") : (' (' + facetFunction(facets,facet,code.value) + ')') : '')}
                    </label>
                </li>)}
            </ul>
        )}
}
</Observer>

export const ObservableMultiselectArrayDropdown = ({ observableValue, codes, labels, disabled }) => <Observer>{() => {
    const [isOpen, setIsOpen] = useState(false);

    const [obj, prop] = observableValue;

    const maxListableElements = 4
    const noneSelectedLabel = labels && labels.noneSelected ? labels.noneSelected : "Ingen valgt"
    const multipleSelectedLabel = labels && labels.multipleSelected ? labels.multipleSelected : "Flere valgt"

    const names = codes.filter(code => obj[prop].indexOf(code.value) > -1).map(code => code.text)
    const buttonText = names.length === 0 ? noneSelectedLabel : names.length > maxListableElements ? multipleSelectedLabel + " (" + names.length + ")" : names.join(', ')
    return (
        <div className={"btn-group" + (isOpen ? " open" : "")}>
            <button type="button" className="multiselect btn btn-default" onClick={() => setIsOpen(!isOpen)} >
                <span className="multiselect-selected-text">{buttonText}</span> <b className="caret"></b>
            </button>
            <div className="dropdown-menu">
                <div className="modal-backdrop" style={{ zIndex: "1210", opacity: "0.00001" }} onClick={() => setIsOpen(false)}> </div>
                <div style={{ position: "relative", zIndex: "1220" }}>
                    <div style={{ paddingRight: "25px" }}>
                        <ObservableMultiselectArrayCheckboxes observableValue={observableValue} codes={codes} disabled={disabled} />
                    </div>
                </div>
            </div>
        </div>
    )
}}</Observer>


class ObservableMultiselectArray extends React.Component {
    constructor(props) {
        super(props);
//        this.prop = prop
            
    }
    UNSAFE_componentWillMount() {
        const {observableValue, codes} = this.props;
        // this.selectHelper = multipleSelectHelper(prop, obj[prop] , codes, this.context.readonly)
    }
    render() {
        const {observableValue, className, codes, label, labels, mode, formlayout, disabled, heading, hideUnchecked, facetFunction, facets, facet, totalCount} = this.props;
        const [obj, prop] = observableValue;
        const hasLabel = !!label;
        const context = UserContext.getContext()
        //console.log("////" + prop +"-" + mode)
        return(
            mode === "check" ?
            <ObservableMultiselectArrayCheckboxes observableValue={observableValue} codes={codes} disabled={context.readonly || disabled} className={hideUnchecked ? "magicList" : className} hideUnchecked={hideUnchecked} facetFunction={facetFunction} facets={facets} facet={facet} totalCount={totalCount}/>
            :
            hasLabel ?
            <div className="hasLabel">
                <label htmlFor={prop}>{label}
                    {formlayout ? <br /> : null}
                    <ObservableMultiselectArrayDropdown observableValue={observableValue} codes={codes} disabled={context.readonly || disabled} labels={labels} facetFunction={facetFunction} facets={facets} facet={facet}/>
                </label>
            </div> :
            <ObservableMultiselectArrayDropdown observableValue={observableValue} heading={heading} hideUnchecked={hideUnchecked} disabled={context.readonly || disabled} codes={codes} labels={labels} facetFunction={facetFunction} facets={facets} facet={facet}/>
        );
	}
}

ObservableMultiselectArray.contextTypes = {
    readonly: PropTypes.bool
}

ObservableMultiselectArray.propTypes = {
    observableValue: PropTypes.array.isRequired
}

export default observer(ObservableMultiselectArray);