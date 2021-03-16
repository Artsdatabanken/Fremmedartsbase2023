import React from 'react'
import renderer from 'react-test-renderer'
import Fylkeskart from './Fylkeskart'

const language = 'NB'

test('Fylkeskart tomt', () => {
    const component = renderer.create(<Fylkeskart
        language={language}
        fylker={{}}/>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('Fylkeskart Sør-Trøndelag', () => {
    const component = renderer.create(<Fylkeskart
        language={language}
        fylker={{
        St: {
            title: 'Sør-Trønadelag',
            style: 'known'
        }
    }}
        styles={{
        known: {
            normal: {
                stroke: "#a54",
                fill: "#e87"
            },
            highlight: {
                stroke: "#400",
                fill: "#f98"
            }
        }
    }}/>)

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})
