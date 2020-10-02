import React, { lazy } from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import Layout from './components/Layout'

const RouteAuthenticated = lazy(() => import('components/RouteAuthenticated'))
const RouteUnauthenticated = lazy(() => import('components/RouteUnauthenticated'))
const Landing = lazy(() => import('pages/Landing'))
const Signin = lazy(() => import('pages/Signin'))
const Register = lazy(() => import('pages/Register'))
const Challenge = lazy(() => import('pages/Challenge'))
const GenerateQR = lazy(() => import('pages/GenerateQR'))

const Scan = lazy(() => import('pages/Scan'))
const Home = lazy(() => import('pages/Home'))
const BulkLocation = lazy(() => import('pages/BulkLocation'))
// const Checkout = lazy(() => import('pages/CheckOut'))
const AutocompleteLocation = lazy(() => import('pages/Prototype/AutocompleteLocation'))

// export const routes = [
//     {
//         path: '/tracing/register=:id',
//         name: 'Register',
//         component: Register,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/qr',
//         name: 'Generate QR Codes',
//         component: GenerateQR,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/updatelocations',
//         name: 'Update Location',
//         component: UpdateLocation,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/updatelocations=:id',
//         name: 'Update Location',
//         component: UpdateLocation,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/locationUpdate',
//         name: 'LocationUpdate',
//         component: LocationUpdate,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/bulklocation',
//         name: 'BulkLocation',
//         component: BulkLocation,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/neighborhoods=:id',
//         name: 'Update Location',
//         component: Locations,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/locationtracing',
//         name: 'Location Tracing',
//         component: LocationTracing,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/viewlocations=:id',
//         name: 'View Location',
//         component: Location,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/viewlocations',
//         name: 'View Locations',
//         component: Locations,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/users=:id',
//         name: 'Update Location',
//         component: Locations,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/welcome',
//         name: 'Soteria Neighborhoods',
//         component: Welcome,
//         icon: Mail,
//         exact: true,
//     },
//     {
//         //PROTOTYPE - DELETE ONE IMPLEMENTED
//         path: '/tracing/addlocation=:id',
//         name: 'autocomplete locations',
//         component: AutocompleteLocation,
//         icon: Mail,
//         exact: true,
//     },
//     {
//         //PROTOTYPE - DELETE ONE IMPLEMENTED
//         path: '/tracing/prototype/floormapping',
//         name: 'Floor Mapper',
//         component: FloorMapping,
//         icon: Mail,
//         exact: true,
//     },
//     {
//         path: '/tracing/:id',
//         name: 'Scan',
//         component: Scan,
//         icon: Mail,
//         hidden: true,
//         exact: true,
//     },
//     {
//         path: '/tracing/',
//         name: 'Error',
//         component: Error,
//         icon: Mail,
//         exact: true,
//     },
// ]

const AppRoutes = () => {
    return (
        <Layout>
            <Router>
                <Switch>
                
                    <RouteUnauthenticated exact path="/tracing/signin" component={Signin} />
                    <RouteUnauthenticated exact path="/tracing/challenge" component={Challenge} />
                    <RouteUnauthenticated exact path="/tracing/register" component={Register} />

                    <RouteAuthenticated exact path="/" component={Home} />
                    <RouteAuthenticated exact path="/tracing" component={Home} />
                    <RouteAuthenticated exact path="/tracing/qr" component={GenerateQR} />
                    <RouteAuthenticated exact path="/tracing/bulklocation" component={BulkLocation} />
                    <RouteAuthenticated exact path="/tracing/addlocation=:id" component={AutocompleteLocation} />

                    <RouteAuthenticated exact path="/tracing/scan=:locationId" component={Scan} />
                    {/* <RouteAuthenticated exact path="/tracing/checkout" component={Checkout} /> */}
                    <RouteAuthenticated exact path="/tracing/:locationId" component={Landing} />
                    
                </Switch>
            </Router>
            </Layout>
    )
}

export default AppRoutes
