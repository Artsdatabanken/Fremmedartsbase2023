import React from 'react'
import boundarySE from './boundary/sweden'
import boundaryNO from './boundary/norway'

const boundaries = {
    'NB': boundaryNO,
    'SV': boundarySE
}

export default class Fylkeskart extends React.Component {
    constructor() {
        super()
        this.state = {
            hoveringOver: null
        }
    }

    static defaultProps = {
        width: "100%",
        height: "100%"
    }

    static getBoundaryForCountry(language) {
        const boundary = boundaries[language]
        if (!boundary)
            throw new Error('Finner ikke grenser for språk "'+language+'".')
        return boundary
    }
    render() {
        const language = this.props.language
        const boundary = Fylkeskart.getBoundaryForCountry(language)
        const styles = this.props.styles
        const readOnly = this.context.readonly || this.props.readonly
        const fylker = Object
            .keys(this.props.fylker)
            .map((kode) => {
                const prefs = this.props.fylker[kode]
                const mainStyle = styles[prefs.style]
                let style = mainStyle.normal
                if (this.state.hoveringOver == kode)
                    style = mainStyle.highlight
                return <Region
                    key={kode}
                    kode={kode}
                    title={prefs.title}
                    boundaryPath={boundary.regions[kode]}
                    style={style}
                    readonly={readOnly}
                    onMouseLeave={(e) => this.setState({hoveringOver: null})}
                    onMouseOver={(e)=> !readOnly && this.setState({hoveringOver: kode})}
                    onMouseDown={(e)=> !readOnly && this.props.onMouseDown(e, kode)}
                    onMouseUp={(e)=> !readOnly && this.props.onMouseUp(e, kode)}
                    />
            })
        return (
            <svg
                x="0px"
                y="0px"
                width={this.props.width}
                height={this.props.height}
                viewBox= {boundary.viewbox}
            >
            <g>{fylker}</g>
            </svg>
        )
    }
}

const Region = ({
        kode, title, boundaryPath, style, readonly, onMouseDown,
        onMouseUp, onMouseOver, onMouseLeave}) =>
    {
    return <g
        key={kode}
        stroke={style.stroke}
        fill={style.fill}
        style={{ cursor: readonly ? "arrow" : "hand" }}
        onMouseDown={ onMouseDown }
        onMouseUp={onMouseUp }
        onMouseOver={ onMouseOver }
        onMouseLeave={ onMouseLeave }
        >
        {boundaryPath}
        <title>{title}</title>
    </g>
}

Fylkeskart.propTypes = {
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    styles: React.PropTypes.object,
    fylker: React.PropTypes.object
}

Fylkeskart.contextTypes = {
    readonly: React.PropTypes.bool,
    language: React.PropTypes.string
}
