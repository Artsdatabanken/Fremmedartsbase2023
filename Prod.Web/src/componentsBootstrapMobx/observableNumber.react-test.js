import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'

import ObservableNumber from './observableNumber'

test('component with float', () => {
    const o = { value: 3.14 }
    const observableValue = [{ value: 3.14 }, 'value']
    const component = renderer.create(
        <ObservableNumber
            observableValue={observableValue}
            integer
            label="label"
            width="30"
        />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('display float', () => {
    const o = { value: 3.14 }
    const actual = ObservableNumber.filterDisplay(o, 'value')
    expect(actual).toBe('3,14')
})

test('display int', () => {
    const o = { value: 314 }
    const actual = ObservableNumber.filterDisplay(o, 'value')
    expect(actual).toBe('314')
})

test('display string', () => {
    const o = { value: '3.14' }
    const actual = ObservableNumber.filterDisplay(o, 'value')
    expect(actual).toBe('3,14')
})

test('display string', () => {
    const o = { value: '3,14' }
    const actual = ObservableNumber.filterDisplay(o, 'value')
    expect(actual).toBe('3,14')
})

test('input .', () => {
    const actual = ObservableNumber.filterNumericInput('3.14')
    expect(actual).toBe('3,14')
})

test('input ,', () => {
    const actual = ObservableNumber.filterNumericInput('3,14')
    expect(actual).toBe('3,14')
})

test('input . trailing', () => {
    const actual = ObservableNumber.filterNumericInput('3.')
    expect(actual).toBe('3,')
})

test('input , trailing', () => {
    const actual = ObservableNumber.filterNumericInput('3.')
    expect(actual).toBe('3,')
})

test('input ,', () => {
    const actual = ObservableNumber.filterNumericInput('.')
    expect(actual).toBe('0,')
})

test('input ,,', () => {
    const actual = ObservableNumber.filterNumericInput('3,1,4,')
    expect(actual).toBe('3,14')
})

test('input int', () => {
    const actual = ObservableNumber.filterNumericInput('314')
    expect(actual).toBe('314')
})

test('input illegal chars', () => {
    const actual = ObservableNumber.filterNumericInput('3 1!4')
    expect(actual).toBe('314')
})
