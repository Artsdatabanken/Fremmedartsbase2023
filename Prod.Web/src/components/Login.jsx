import React from 'react'
import {observable} from 'mobx'
import auth from './authService'

import * as Xcomp from './observableComponents'


export default class Login extends React.Component {
    login(e) {
        e.preventDefault()
        auth.login();
    }

    render() {
        return (
            <form role="form">
                <Xcomp.Button onClick={(e) => this.login(e) }><span>Logg inn</span></Xcomp.Button>
            </form>
        )
    }
}
