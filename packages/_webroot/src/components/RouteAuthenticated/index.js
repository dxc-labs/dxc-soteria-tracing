import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import { hasCookie } from 'services/Authentication'

const RouteAuthenticated = ({ component: Component, path }) => {
    let pathname = window.location.pathname
    if (!hasCookie()) {
        return <Redirect to={`/tracing/signin?redirect=${pathname}`} />
    }
    return <Route component={Component} path={path} />
}

export default RouteAuthenticated
