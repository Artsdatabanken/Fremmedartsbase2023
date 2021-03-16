import React from 'react'
import renderer from 'react-test-renderer'
import Fylkesliste from './Fylkesliste'

test('Fylkesliste', () => {
    const component = renderer.create(<Fylkesliste
        rows={[
        {
            key: 'OsA',
            title: 'Oslo'
        }, {
            key: 'He',
            title: 'Hedmark'
        }
    ]}
        columns={[
        {
            title: 'kjent',
            values: {
                'OsA': true
            }
        }, {
            title: 'antatt',
            values: {
                'He': true
            }
        }
    ]}/>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})
