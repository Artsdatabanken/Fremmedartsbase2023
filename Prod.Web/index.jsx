

import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Provider } from 'mobx-react';
import App from './src/app';
import viewModel from './src/components/viewModel'
import { UserManager } from 'oidc-client';
import auth from './src/components/authService'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'


if (import.meta.env.PROD) {
    window.appInsights = new ApplicationInsights({
        config: {
            instrumentationKey: window.location.href.indexOf("test.") > 1 ? '30685b0e-8736-4205-9839-99dd918f986f' : 'ab7c8c2e-7415-4db4-bcce-eed403f6f2b6',
            autoTrackPageVisitTime: true,
            enableAutoRouteTracking: true,
            disableFetchTracking: false,
            enableCorsCorrelation: true,
            enableRequestHeaderTracking: true,
            enableResponseHeaderTracking: true
            /* ...Other Configuration Options... */
        }
    });
    window.appInsights.loadAppInsights();
    window.appInsights.trackPageView(); // Manually call trackPageView to establish the current user/session/pageview
}
// Håndtering av pålogging
// #silentredirect er callback ved henting av ny token via refreshtokens - foregår i en iframe
if ((window.location.href.indexOf("silentredirect") > 1)) {
    // må instansiere en ny Usermanager - da den bare skal pinge opp til applikasjonen som åpnet iframe - dette skejr automagisk
    // hadde vi gjenbrukt samme auth.usermanager som i app eller instansiert med config - går det galt .....
    new UserManager().signinSilentCallback().catch((error) => this.handleError(error));
    new UserManager().signinPopupCallback().catch((error) => this.handleError(error));
}
else {
    if (window.location.href.indexOf("signin-oidc") > 1) {
        // callback for login - redirect fra autetiseringsserver
        auth.completeLogin(
            function () {
                console.log("comletelogin...")
                // url inneholder token o.l - kjør redirect for å rydde moroa
                // ønsker heller ikke historikk i browser som holder gammel token
                window.history.replaceState({},
                    window.document.title,
                    window.location.origin + window.location.pathname);
                window.location.href = window.location.href;
                console.log("window.location.hash set - will not navigate")
            }
        );
    } else {
        // Her er man kanskje inlogget ... prøv hent bruker
        auth.loadUser();
    }

    window.onbeforeunload = (e) => {
        var isdirty = viewModel.isDirty
        var skriver = !!viewModel.roleincurrentgroup && viewModel.roleincurrentgroup.writeAccess
        var flag = isdirty && writeAccess
        if (flag) {
            // e.preventDefault()
            e.returnValue = "du lukker siden uten å ha lagret"
        }
    }

    var string =
        `<div style="max-width:50%;margin:auto;">
        <h1>Rødlista</h1>
        <p>Du har forsøkt å åpne Rødlista i nettlesereren Internet Explorer, hvor vi ikke har en ferdig løsning enda.</p>
        <p> Hvis du ønsker å benytte deg av den nåværende løsningen kan du vurdere å oppgradere nettleseren din, eller benytte en annen nettleser. Kanskje har du allerede andre installert på maskinen din? Under følger en liste over nettlesere vi vet fungerer:</p>
          <ul>
            <li>Firefox: <a href="https://www.mozilla.org/nb-NO/firefox/new/">Last ned</a></li>
            <li>Google Chrome: <a href="https://support.google.com/chrome/answer/95346?co=GENIE.Platform%3DDesktop&hl=no">Last ned</a></li>
            <li>Microsoft Edge: <a href="https://www.microsoft.com/nb-no/windows/microsoft-edge">Last ned</a></li>
          </ul>
        </p>
     </div>`

    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if (isIE11) {
        document.open();
        document.write(string);
        document.close();
    } else {
        const appState = viewModel
        const container = document.getElementById('root');
        const root = createRoot(container); // createRoot(container!) if you use TypeScript
        root.render(
            <Provider appState={appState}>
                <App />
            </Provider>
        );
    }
}
