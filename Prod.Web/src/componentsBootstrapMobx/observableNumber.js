import React from 'react'
import {PropTypes} from 'prop-types';
import { action, isObservable } from 'mobx'
import { Observer } from 'mobx-react'

import {UserContext} from './components'

// @observer
// export default class ObservableNumber extends React.Component {
//   context = useUserContext()
//   render() {
//     const { observableValue, validate, integer, label, width, disabled } = this.props
//     const [obj, prop] = observableValue
//     // const obstype = typeof(obj[prop])
//     //console.log("obstype (" + prop + "):" + obstype + "  value: " + obj[prop])

//     const hasLabel = !!label
//     const isInvalid =
//       validate && typeof validate === 'function' && !validate(obj[prop])

//     console.log("context: " + JSON.stringify(this.context) + "#" + this.props.readonly + "¤" + this.eeee )
//     // console.log("config: " + JSON.stringify(this.context) + "#" + this.props.readonly + "¤" + this.eeee )


//     return (
//       <div className={isInvalid ? 'has-error' : null}>
//         <span>
//           {hasLabel && <label htmlFor={prop}>{label}</label>}
//           <input
//             className="form-control"
//             name={prop}
//             value={ObservableNumber.filterDisplay(obj, prop)}
//             onChange={action(e => {
//               obj[prop] = ObservableNumber.filterNumericInput(
//                 e.currentTarget.value,
//                 integer
//               )
//             })}
//             disabled={this.context.readonly || disabled}
//             style={{ width }}
//           />
//         </span>
//       </div>
//     )
//   }

//   static filterDisplay(obj, prop) {
//     if (obj[prop] || obj[prop] === 0)
//       return ObservableNumber.filterNumericInput(obj[prop].toString())
//     return ''
//   }

//   static filterNumericInput(s, integer = false) {
//     let r = ''
//     const digits = '0123456789'
//     let decimalSeparators = integer ? '' : '.,'

//     let decimalPointOffset = undefined
//     for (const i in s) {
//       const c = s[i]
//       if (digits.indexOf(c) >= 0) r += c
//       else if (!decimalPointOffset && decimalSeparators.indexOf(c) >= 0)
//         decimalPointOffset = r.length
//     }
//     if (decimalPointOffset < s.length)
//       r = r.slice(0, decimalPointOffset) + ',' + r.slice(decimalPointOffset)
//     if (decimalPointOffset === 0) r = '0' + r
//     return r
//   }
// }

// ObservableNumber.contextTypes = {
//   readonly: PropTypes.bool
// }

// ObservableNumber.propTypes = {
//   integer: PropTypes.bool,
//   observableValue: PropTypes.array.isRequired
// }

function filterDisplay(obj, prop) {
  if (obj[prop] || obj[prop] === 0)
    if (obj[prop] === 'ERROR!')
        return 'ERROR!'
    else return filterNumericInput(obj[prop].toString())
  return ''
}

function filterNumericInput(s, integer = false) {
  let r = ''
  const digits = '0123456789'
  let decimalSeparators = integer ? '' : '.,'

  let decimalPointOffset = undefined
  for (const i in s) {
    const c = s[i]
    if (digits.indexOf(c) >= 0) r += c
    else if (!decimalPointOffset && decimalSeparators.indexOf(c) >= 0)
      decimalPointOffset = r.length
  }
  if (decimalPointOffset < s.length)
    r = r.slice(0, decimalPointOffset) + ',' + r.slice(decimalPointOffset)
  if (decimalPointOffset === 0) r = '0' + r
  return r
}


const ObservableNumber = (props) => <Observer>{() => {
  const context = UserContext.getContext()
  const { observableValue, validate, integer, label, width, disabled, displayed, className } = props
  const [obj, prop] = observableValue
  // const obstype = typeof(obj[prop])
  //console.log("obstype (" + prop + "):" + obstype + "  value: " + obj[prop])

  const hasLabel = !!label
  const isInvalid =
    validate && typeof validate === 'function' && !validate(obj[prop])

//  console.log("context: " + JSON.stringify(context) + "#" +  isObservable(context))
  return (
    <div className={isInvalid ? 'has-error' : className}>
      <span>
        {hasLabel && <label htmlFor={prop}>{label}</label>}
        <input
          className="form-control"
          name={prop}
          value={displayed ? displayed : filterDisplay(obj, prop)}
          onChange={action(e => {
            obj[prop] = filterNumericInput(
              e.currentTarget.value,
              integer
            )
          })}
          disabled={context.readonly || disabled}
          style={{ width }}
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

