import React from 'react'
import { PropTypes } from 'prop-types';
import { action, isObservable, observable } from 'mobx'
import { Observer } from 'mobx-react'

import { UserContext } from './components'

function filterDisplay(obj, prop, yearRange) {
    if (obj[prop] || obj[prop] === 0)
        if (obj[prop] === 'ERROR!')
            return 'ERROR!'
        else if (yearRange && (obj[prop] < 0 || obj[prop] > 2024))
            return 'Oppgi korrekt årstall!'
        else return filterNumericInput(obj[prop].toString())
    return ''
}

function getErrors(observableErrors) {
    const result = {}
    if (observableErrors) {
        const errorKeys = observableErrors.slice(1)
        const errorhandler = observableErrors[0]
        const errors = []
        for (const key of errorKeys) {
            // console.log("#%% errorkey: " + key + " value: " + errorhandler.errors[key])
            if (errorhandler.errors[key]) {
                errors.push(errorhandler.errors[key])
            }
        }
        result.hasObservableErrors = true
        result.hasErrors = errors.length > 0
        result.errors = errors
        result.errorKeys = errorKeys
    } else {
        result.hasObservableErrors = false
        result.hasErrors = false
    }
    return result
}

function filterNumericInput(s, integer = false) {
    let r = ''
    const digits = '0123456789'
    let decimalSeparators = integer ? '' : '.,'

    let decimalPointOffset = undefined
    for (const i in s) {
        const c = s[i]
        if (digits.indexOf(c) >= 0 || decimalPointOffset == s.indexOf(c)) r += c
        else if (decimalPointOffset == undefined && decimalSeparators.indexOf(c) >= 0) {
            decimalPointOffset = s.indexOf(c)

        }
    }
    if (decimalPointOffset <= s.length) {
        r = r.slice(0, decimalPointOffset) + ',' + r.slice(decimalPointOffset)

    }

    if (decimalPointOffset === 0) r = '0' + r

    //return integer ? parseInt(r) : parseFloat(r)
    return r == "" ? null : integer ? parseInt(r) : r
}


const ObservableNumber = (props) => <Observer>{() => {
    const context = UserContext.getContext()

    const { observableValue, observableErrors, validate, integer, label, width, disabled, displayed, className, yearRange } = props
    const [obj, prop] = observableValue
    // const obstype = typeof(obj[prop])
    //console.log("obstype (" + prop + "):" + obstype + "  value: " + obj[prop])

    const hasLabel = !!label
    const isInvalid =
        validate && typeof validate === 'function' && !validate(obj[prop])


    const { hasErrors, errors } = getErrors(observableErrors)
    // if(hasErrors) {
    //     console.log("#%% - " + prop)
    //     for(const msg of errors) {
    //       console.log("#%%Error: " + msg)
    //     }
    // }


    //  console.log("context: " + JSON.stringify(context) + "#" +  isObservable(context))
    return (
        <div className={isInvalid ? 'has-error' : className}>
            <span>
                {hasLabel && <label htmlFor={prop}>{label}</label>}
                <input
                    className="form-control"
                    disabled={context.readonly || disabled}
                    style={{ borderColor: (hasErrors) ? 'red' : null }}
                    name={prop}
                    value={displayed ? displayed : filterDisplay(obj, prop, yearRange)}
                    // disabled={(context.readonly && !auth.isAdmin)|| disabled } // SAH tok bort 14.12.2021 - duplett av den over og auth er ikke tilgjengelig
                    onChange={action(e => {
                        obj[prop] = filterNumericInput(
                            e.currentTarget.value,
                            integer
                        )
                    })}


                />
            </span>
        </div>
    )
}}</Observer>

ObservableNumber.propTypes = {
    integer: PropTypes.bool,
    observableValue: PropTypes.array.isRequired
}

export default ObservableNumber

