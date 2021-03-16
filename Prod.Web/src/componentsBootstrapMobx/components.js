import viewModel from '../components/viewModel'
//export const UserContext = viewModel.UserContext


// react context api does not work with the current version of mobx
// when using observe (both observe() and <Observe></Observe> does not work)
// This is a workaround, but is global. 
export const UserContext = {
    getContext: () => viewModel.userContext
}


export {default as Bool} from './observableBool'
export {default as String} from './observableString'
export {default as Password} from './observablePassword'
export {default as HtmlString} from './observableHtmlString';
export {default as MultiselectArray} from './observableMultiselectArray';
export {default as StringCombobox} from './observableStringCombobox';
export {default as StringEnum, Radio} from './observableStringEnum';
export {default as Number} from './observableNumber';
export {default as Button} from './button';


