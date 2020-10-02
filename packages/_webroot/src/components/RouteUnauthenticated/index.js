import React from 'react'
import { Redirect, Route } from 'react-router-dom'

import { hasCookie } from 'services/Authentication'

const RouteUnauthenticated = ({ component: Component, path }) => {
    if (hasCookie()) {
        return <Redirect to="/tracing" />
    }

    return <Route component={Component} path={path} />
}

export default RouteUnauthenticated
