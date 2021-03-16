import React, {Component} from 'react'
import Loading from './Loading'

const LoadingHoc = (propName) => (WrappedComponent) => {
    return class Loader extends Component {
        render() {
            // return this.isEmpty(this.props[propName])
            return !this.props[propName]
                ? <Loading/>
                : <WrappedComponent {...this.props}/>
        }

        isEmpty(prop) {
            return (prop === null || prop === undefined || (prop.constructor === Object.keys(prop).length === 0))
        }
    }
}

export default LoadingHoc