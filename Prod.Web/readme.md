# Rødlista 2019 Editing Edition

### This project is created to facilitate easy editing of the RL2019 project, with no external dependencies

## Requirements: 
    Node>=10
    NPM >=6

## Running the project

### Initialize project:
    npm install

### Compile and serve, with hot realoading:
    npm run dev

### Open SPA:
    http://localhost:1234

## Relevant links:
- *Backlog* https://github.com/bugdriven/RL2019Assessment/projects/1
- *Login 2015* https://database.artsdatabanken.no/RLMoser2017/autentiser/logon?ReturnUrl=%2fRLMoser2017
- *The page for rl2015 version* https://database.artsdatabanken.no/RLMoser2017
- *Files from 2015* https://git.artsdatabanken.no/Repository/4e9627b4-d251-45d0-8481-341a53efe06f/master/Tree/Rodliste2015.Web/Views/Home

## To Register a new page tab:

- create the file you wish to import
- in viewModel, create a new tabItem (in the extendObservable), somwjhere around line 200
- in assesment.js, import the class and use in the assesment criteria
