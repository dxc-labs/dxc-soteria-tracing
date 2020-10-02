import React, { Suspense } from 'react'
import AppRoutes from 'AppRoutes'
import { HashRouter } from 'react-router-dom'

import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import DXC from 'assets/themes/DXC'
import { CookiesProvider } from 'react-cookie'

import Amplify from 'aws-amplify'

const theme = createMuiTheme(DXC)

Amplify.configure({
    Auth: {
        region: process.env.REACT_APP_COGNITO_USER_POOL_ID.split('_')[0],
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
    },
})

console.log(process)
console.log(process.env)

function App() {
    return (
        <HashRouter>
            <CookiesProvider>
                <Suspense fallback={<div>Loading...</div>}>
                    <ThemeProvider theme={theme}>
                        <AppRoutes />
                    </ThemeProvider>
                </Suspense>
            </CookiesProvider>
        </HashRouter>
    )
}

export default App
