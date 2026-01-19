import { Configuration, LogLevel } from '@azure/msal-browser'

// Microsoft Entra ID (Azure AD) Configuration
// Get these values from Azure Portal > App Registrations
const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID || ''
const MSAL_TENANT_ID = import.meta.env.VITE_MSAL_TENANT_ID || 'common'

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            break
          case LogLevel.Warning:
            console.warn(message)
            break
          case LogLevel.Info:
            console.info(message)
            break
          case LogLevel.Verbose:
            console.debug(message)
            break
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
}

// Scopes for Microsoft Graph API (including SharePoint access)
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email', 'Sites.Read.All', 'Sites.ReadWrite.All'],
}

// Helper to check if MSAL is configured
export const isMsalConfigured = (): boolean => {
  return Boolean(MSAL_CLIENT_ID && MSAL_CLIENT_ID.length > 10)
}
