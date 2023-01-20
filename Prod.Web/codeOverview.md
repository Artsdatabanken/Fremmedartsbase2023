# Code overview

## index.html and index.js

basic services are invoked here
Bootstrap.js
React
Mobx
Authservice
Application insights

### app.js
The html base frames of the page and header is rendered here

the global appState is injected here.

#### appview.js

main menu

Login, apply for access or AppViewMain

In according to appState.viewMode AppvViewMain shows 
- "assessment" - <Assessment>
- "moveassessment" - <AssessmentMove>
- "choosespecie" -  <AssessmentsView>
- "newassessment" -  <AssessmentNew>
- "administrasjon" - <ExpertGroupAdmin>

##### assessment.js
This is the complete view of the (one) assessment 
In principle this part of the code is the only difference between redlist assessment and alien species assessment application
(in practice there will be more things like map functionality e.g.)

the property RiskAssessment contains all properties that affect the risklevels. It was initially done to make things clearer and to help with unit testing. This object has (in alien species verson) grown considerably, and an other structure can be considered.


##### assessmentsView.js
(preferably could have ben named assessmentsChooseSpecie)
Here is the functionality for choosing an assessment (specie) for editing. ExpertGroup can also be choosen here.


viewModel.js 
This is the basic object that keep track of the current chosen assessment and chosen expertGroup ++
It also contains functionality for creating new assassment and more 


appState is the same as the viewModel object
The difference is only historic. appState can be renamed to viewModel for clarity.


# how is the assessment loaded from the database and instansiateded in the model

viewModel.setCurrentAssessment(id) starts the process and loads the data
viewModel.updateCurrentAssessment instansiate the assessment object trough enhanceAssessment() and updates isDirty functionality
viewModel.enhanceAssessment(json) is where to juicy stuf happens

# enhanceAssessment.js

Some convinience (computed) properties are added to the assessment model


# enhanceCriteria.js

All setting of computed risklevels () are done here
That also include various computed values needed for the aggregation
Also some text messages and some relevant console logging

# riskLevel.js
The actual code for calculation of the risklevels are here.
This code is not reactive (mobx) of historic reasons only.

# orrorHandler.js
A module for reactive handling of errors and warnings

# errordefinitions.js
All errors and warnings are defined here.
They are available for the application through the errorHandler.js



