export function routeMatcher(uri, route) {

    // //remove query string and anchor from uri to test
    // const match = /^(.*)\?.*#.*|(.*)(?=\?|#)|(.*[^\?#])$/.exec(request.uri);
    // const uriPartToCheck = match[1] || match[2] || match[3];
    // uri = uriPartToCheck

    // // if route is a regexp path
    // if (route instanceof RegExp) {
    //     return uri.match(route) !== null;
    // }

    // if route is parameterized path
    if (route.indexOf(':') !== -1) {

        const decodeParmeterValue = (v) => {
            return !isNaN(parseFloat(v)) && isFinite(v) ? (Number.isInteger(v) ? Number.parseInt(v, 10) : Number.parseFloat(v)) : v;
        };

        // figure out key names
        const keys = [];
        const keysRE = /:([^\/\?]+)\??/g;
        let keysMatch = keysRE.exec(route);
        while (keysMatch != null) {
            keys.push(keysMatch[1]);
            keysMatch = keysRE.exec(route);
        }

        // change parameterized path to regexp
        const regExpUri = route
        //                             :parameter?
                            .replace(/\/:[^\/]+\?/g, '(?:\/([^\/]+))?')
        //                             :parameter
                            .replace(/:[^\/]+/g, '([^\/]+)')
        //                             escape all /
                            .replace('/', '\\/');

        // checks if uri match
        const routeMatch = uri.match(new RegExp(`^${regExpUri}$`));
        if (!routeMatch) {
            // return false;
            return null;
        }

        //              no no ---      // update params in request with keys
        const params = keys.reduce((acc, key, index) => {
            let value = routeMatch[index + 1];
            if (value) {
                value = value.indexOf(',') !== -1 ? value.split(',').map(v => decodeParmeterValue(v)) : value = decodeParmeterValue(value);
            }
            acc[key] = value;
            return acc;
        }, {});



        // return true;
        return params;
    }

    // if route is a simple path
    return route === uri ? {} : null;
}

export function router(url, routes) {
    // routes are in the shape:
    // [["routedescritpon", function], ...]
    // - the function can be and do anything. It recieves the parameters from route as input. 
    // e.g.:
    // const routes = [
    //     ["items/:id", params => "item id:" + params.id ],
    //     ["about/info", () => "about info" ]
    // ]
    const found = routes.find((routeing) => {
        const route = routeing[0]
        const match = routeMatcher(url, route)
        return match !== null 
    })
    if (found) {
        const route = found[0]
        const match = routeMatcher(url, route)
        const func = found[1]
        const result = func(match)
        return result
    } else {
        return undefined
    }
}
