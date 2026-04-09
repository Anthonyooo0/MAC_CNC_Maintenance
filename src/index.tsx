import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import { App } from './App';
import { IS_DEV_MODE } from './devMode';
import './index.css';

if (IS_DEV_MODE) {
  // Dev mode: skip MSAL entirely, render app directly
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  const msalInstance = new PublicClientApplication(msalConfig);

  msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().then((response) => {
      if (response) msalInstance.setActiveAccount(response.account);
      else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) msalInstance.setActiveAccount(accounts[0]);
      }
    });

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>
    );
  });
}
