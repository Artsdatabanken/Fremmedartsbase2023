import React from 'react'
import PropTypes from 'prop-types'


const ProgressBar = ({
    prefixCls, strokeWidth, trailWidth, strokeColor,
    trailColor, strokeLinecap, percent, style, className,
}) => {

    const pathStyle = {
        strokeDasharray: '100px, 100px',
        strokeDashoffset: `${(100 - percent)}px`,
        transition: 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s linear',
    }

    const center = strokeWidth / 2
    const right = 100 - (strokeWidth / 2)
    const pathString = `M ${center},${center} L ${right},${center}`
    const viewBoxString = `0 0 100 ${strokeWidth}`

    return (
        <svg
            className={`${prefixCls}-line ${className}`}
            viewBox={viewBoxString}
            preserveAspectRatio="none"
            style={style}>
            <path
                className={`${prefixCls}-line-trail`}
                d={pathString}
                strokeLinecap={strokeLinecap}
                stroke={trailColor}
                strokeWidth={trailWidth || strokeWidth}
                fillOpacity="0" />
            <path
                className={`${prefixCls}-line-path`}
                d={pathString}
                strokeLinecap={strokeLinecap}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fillOpacity="0"
                style={pathStyle} />
        </svg>
    )
}

ProgressBar.defaultProps = {
    prefixCls: 'rc-progress',
    strokeWidth: 1,
    strokeColor: '#039be5',
    trailWidth: 1,
    trailColor: '#D9D9D9',
    strokeLinecap: 'round',
    className: ''
}

ProgressBar.propTypes = {
    prefixCls: PropTypes.string,
    strokeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    strokeColor: PropTypes.string,
    trailWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    trailColor: PropTypes.string,
    strokeLinecap: PropTypes.oneOf(['round', 'square']),
    style: PropTypes.object,
    className: PropTypes.string,
}

export default ProgressBar
