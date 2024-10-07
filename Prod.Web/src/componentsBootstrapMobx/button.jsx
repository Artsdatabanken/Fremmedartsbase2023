import React from 'react';
import { UserContext } from './components'
import auth from '../components/authService';

// Button has no observable functionality, but is included in XComp lib for styling reasons

export default function Button(props) {
    // material ui color props : default, primary, secondary, disabled
    // bootstrap color props : default, primary, success, info, warning, danger, link
    // nb: bootstrap has (extra) disabled atribute for all collors
    // bootstrap sizes: lg, "", sm, xs
    const context = UserContext.getContext();
    const { onClick, primary, style, lg, sm, xs, disabled, alwaysEnabled, ariaLabel, className, title, href } = props;
    const colorStyle = primary ? " btn-primary" :
        " btn-default"
    const sizeStyle = lg ? " btn-lg" :
        sm ? " btn-sm" :
            xs ? " btn-xs" :
                ""
    const classString = "btn" + colorStyle + sizeStyle + (className ? " " + className : "")

    const params = {}
    // if ((context.readonly || disabled) && !alwaysEnabled && !auth.isAdmin) {
    if ((context.readonly || disabled) && !alwaysEnabled) {
        params.disabled = true
    }
    if (ariaLabel) {
        params["aria-label"] = ariaLabel
    }

    return (href
        ? <a className={classString} {...params} title={title} href={href} target="blank">{props.children}</a>
        : <button className={classString} {...params} style={style} title={title} onClick={onClick}>{props.children}</button>
    )
}
