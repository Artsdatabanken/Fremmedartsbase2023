import React from 'react'
import renderer from 'react-test-renderer'
import Filliste from './Filliste'

const txtFil = {
    Filename: 'readme.txt',
    Size: 1024,
    Url: '/FA3_732/readme.txt'
}

const pdfFil = {
    Filename: 'peregrine.pdf',
    Size: 32412,
    Url: '/FA3_381/peregrine.pdf'
}

test('Filliste med fil', () => {
    const component = renderer.create(<Filliste
        labels={{}}
        Files={[txtFil]}
        selectedFile={{}}
        activeUploads={[]}
        baseDirectory='datasett' />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('Filliste med valgt fil', () => {
    const component = renderer.create(<Filliste
        labels={{}}
        Files={[pdfFil, txtFil]}
        selectedFile={txtFil}
        activeUploads={[]}
        baseDirectory='datasett' />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('Opplasting', () => {
    const component = renderer.create(<Filliste labels={{}} Files={[txtFil]} selectedFile={{}} activeUploads={[pdfFil]} />)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()

    tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})

test('Tom filliste', () => {
    const component = renderer.create(<Filliste
        labels={{}} Files={[]} activeUploads={[]} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
})
