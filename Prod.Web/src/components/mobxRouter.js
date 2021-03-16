import {autorun, observable, action} from 'mobx'

const mobxRouter = observable({
    hash: window.location.hash
})

autorun(() => {
    window.location.hash = mobxRouter.hash
})

handleHashChange(action((e) => {
    action(mobxRouter.hash = window.location.hash)
}))

 // supporting some older browsers
 function  handleHashChange(callback) {
    if (!('onhashchange' in window)) {
      var oldHref = location.href;
      setInterval(function() {
        var newHref = location.href;
        if (oldHref !== newHref) {
          var _oldHref = oldHref;
          oldHref = newHref;
          callback.call(window, {
            'type': 'hashchange',
            'newURL': newHref,
            'oldURL': _oldHref
          });
        }
      }, 100);
    } else if (window.addEventListener) {
      window.addEventListener("hashchange", callback, false);
    } else if (window.attachEvent) {
      window.attachEvent("onhashchange", callback);    
    } 
  }

export default mobxRouter