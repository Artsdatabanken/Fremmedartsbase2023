# Fremmedartsbase

# Code overwiew
[code Overview](codeOverview.md)

## Requirements:
    Node>=20
    NPM >=10

### Initialize project:
    Ensure you have the correct Node and NPM versions
    In the Prod.Web directory, run: npm install

## Running the project
    To run the application with a local backend: npm run local
    To run the application with the dev API: npm run dev
    NOTE: Using the dev API temporarily requires the app to be run on port 1234, will be default once a test environment for Fremmedartsbase is up and running

## To Register a new page tab:

- create the file you wish to import
- in assessmentTabdefs, create a new item (in the tabinfos). (tabInfos.js defines the properties of the item and transform it for the use of the tabs.js module)
- in assesment.js, import the class and use in the assesment criteria
