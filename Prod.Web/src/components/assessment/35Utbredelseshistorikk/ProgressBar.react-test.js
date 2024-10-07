import React from 'react'
import renderer from 'react-test-renderer'
import ProgressBar from './ProgressBar'

function assert(targetComponment) {
    const component = renderer.create(targetComponment)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
}

test('Progress bar 0%', () => {
    assert(<ProgressBar percent={0} />)
})

test('Progress bar 100%', () => {
    assert(<ProgressBar percent={100} />)
})
