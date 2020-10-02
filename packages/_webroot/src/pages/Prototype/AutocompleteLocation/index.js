import React, { useEffect, useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'

import { useCookies } from 'react-cookie'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'
import { useLocation, useHistory } from 'react-router-dom'
import {
    Typography,
    Checkbox,
    Grid,
    FormControlLabel,
    TextField,
    InputAdornment,
    CircularProgress,
    Backdrop,
    Button,
} from '@material-ui/core'

import { getLocations, patchLocation } from 'services/api_new'
import Alert from '@material-ui/lab/Alert'

//import { useLocation } from 'react-router-dom'

import { v4 as uuidv4 } from 'uuid'

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(2),
        padding: theme.spacing(1),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
}))

const AutocompleteLocation = () => {
    const classes = useStyles()
    const [loading, setLoading] = React.useState(false)
    const [addLocation, setAddLocation] = useState('')
    const [finalLocation, setFinalLocation] = useState('')
    const [rootLocations, setRootLocations] = useState([])
    const [selectedRoot, setSelectedRoot] = useState(null)
    const [allLocations, setAllLocations] = useState(null)
    const [locations, setLocations] = useState(null)
    const [checked, setChecked] = useState(true)
    const [locationCodeToAdd, setLocationCodeToAdd] = useState('')
    const [mappedlocations, setMappedLocations] = useState(null)
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(false)
    const route = useLocation()
    const history = useHistory()
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])
    const maxAge = 365 * 24 * 60 * 60
    const expires = new Date()
    expires.setDate(expires.getDate() + 365)
    const [value, setValue] = useState(cookies.country)

    useEffect(() => {
        // Only for updating dropdownbox

        if (!cookies.location && !cookies.country) {
            console.log('on loading')
            setLoading(true)
            getLocations({ fields: 'locationCode', root: 'true' }).then((roots) => {
                setRootLocations(roots)
                console.log(roots)
                setLoading(false)
            })

            getLocations({ fields: 'locationCode' }).then((locations) => {
                setAllLocations(locations)
                setLoading(false)
            })
        } else {
            var rootCountry = [{ locationCode: cookies.country }]
            setLoading(false)
            setRootLocations(rootCountry)
            var sublocation = [{ locationCode: cookies.location }]
            setLocations(sublocation)
            //setLocationCodeToAdd(cookies.location)
            console.log('cookies', cookies.country, cookies.location)
        }
    }, [])

    const checkMapped = (arr) => {
        let temploc = []
        arr.forEach((item) => {
            if (item.hasOwnProperty('allocated')) {
                if (item['allocated']) {
                    temploc.push(item['locationCode'])
                }
            }
        })
        setMappedLocations(temploc)
        console.log(temploc)
    }

    const onUpdateRoot = (val) => {
        //console.log(val)
        let rootLocation = ''
        if (cookies.country) {
            rootLocation = val
        } else {
            rootLocation = val.locationCode
        }
        console.log('root location', rootLocation)
        setSelectedRoot(rootLocation)

        setLoading(true)
        getLocations({ q: rootLocation }).then((locations) => {
            setLocations(locations)
            checkMapped(locations)
            console.log(locations)
            setLoading(false)
        })
    }

    const handlesublocation = () => {
        const subloc = finalLocation
        const rootLocation = selectedRoot
        let cookielocation = finalLocation.split('/')
        var temp = cookielocation[0]
        var i
        for (i = 1; i < cookielocation.length - 1; i++) {
            temp += '/' + cookielocation[i]
        }
        console.log(temp)
        setCookie('location', temp, {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        setCookie('country', rootLocation, {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
    }

    const handleAddLocationCode = () => {
        let locationId = route.pathname.split('=').slice(-1)[0]
        console.log('location id ', locationId)

        let tempLocationCode = finalLocation.replace(/ \/ |\/| \//g, '#')
        if (!tempLocationCode.startsWith(selectedRoot)) {
            tempLocationCode = selectedRoot.concat(`#${tempLocationCode}`)
        }
        console.log('location to send', tempLocationCode)
        if (mappedlocations.includes(tempLocationCode)) {
            setError(true)
        } else {
            let payload = {}
            let update = false
            setError(false)
            payload = {
                locationCode: tempLocationCode,
            }

            console.log(JSON.stringify(payload))
            patchLocation(payload, locationId).then((res) => {
                console.log(res)
                if (res.status == 200) {
                    history.replace(`/tracing/${locationId}`)
                } else {
                    console.log('error updating location')
                }
            })
        }
    }

    const columns = [
        { title: 'ID', field: 'id' },
        { title: 'Location Code', field: 'locationCode' },
        { title: 'Last Cleaned', field: 'lastCleaned' },
        { title: 'Last Checked In', field: 'lastCheckedIn' },
    ]

    const options = {
        pageSize: 10,
    }

    // const handleTooltipClose = () => {
    //     setOpen(false)
    // }

    // const handleTooltipOpen = () => {
    //     setOpen(true)
    // }
    const removeCookies = (event) => {
        setChecked(event.target.checked)
        removeCookie('location', {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        removeCookie('country', {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        window.location.reload()
    }
    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Grid container justify="center" alignItems="center">
                <Grid item xs={12}>
                    <Typography variant="h5">QR Code Location Mapping</Typography>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <Grid container direction="column" spacing={3}>
                            {cookies.country && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={rootLocations}
                                        getOptionLabel={(option) => option.locationCode}
                                        value={{ locationCode: value }}
                                        onInputChange={(e, v) => {
                                            onUpdateRoot(v)

                                            //setValue(v)
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Select Root"
                                                placeholder="Root"
                                                margin="normal"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            )}

                            {!cookies.country && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={rootLocations}
                                        getOptionLabel={(option) => option.locationCode}
                                        onChange={(e, v) => {
                                            onUpdateRoot(v)

                                            //setValue(v)
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Root"
                                                placeholder="Select Root"
                                                margin="normal"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            )}
                            {error && (
                                <Alert severity="error">This location is already mapped— please add a new one!</Alert>
                            )}
                            {selectedRoot && cookies.location && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        freeSolo
                                        clearOnBlur={false}
                                        options={locations}
                                        getOptionLabel={(option) => {
                                            let locationCode = option.locationCode
                                            locationCode = locationCode.replace(/#/g, '/')
                                            return locationCode
                                        }}
                                        defaultValue={{
                                            locationCode: cookies.location,
                                        }}
                                        onInputChange={(e, v) => {
                                            //setEmail(v)
                                            setLocationCodeToAdd(v)
                                            setFinalLocation(v)
                                            setError(false)
                                            //setValue(v)
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Location Search"
                                                placeholder="Search..."
                                                margin="normal"
                                                fullWidth
                                            />
                                        )}
                                    />

                                    <TextField
                                        label="Location"
                                        fullWidth
                                        placeholder="Location"
                                        variant="filled"
                                        // By setting loccode the user cant delte
                                        value={`${locationCodeToAdd}/${addLocation}`}
                                        onChange={(e) => {
                                            // Error handling needed
                                            const userInput = e.target.value.split(`${locationCodeToAdd}/`)[1]
                                            setAddLocation(userInput)
                                            setFinalLocation(e.target.value)
                                            setError(false)
                                        }}
                                    />
                                </Grid>
                            )}
                            {selectedRoot && !cookies.location && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        freeSolo
                                        clearOnBlur={false}
                                        options={locations}
                                        getOptionLabel={(option) => {
                                            let locationCode = option.locationCode
                                            locationCode = locationCode.replace(/#/g, '/')
                                            return locationCode
                                        }}
                                        // value={{ locationCode: value }}
                                        onInputChange={(e, v) => {
                                            //setEmail(v)
                                            setLocationCodeToAdd(v)
                                            setFinalLocation(v)
                                            setError(false)
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Location Search"
                                                placeholder="Search..."
                                                margin="normal"
                                                fullWidth
                                            />
                                        )}
                                    />

                                    <TextField
                                        label="Location"
                                        fullWidth
                                        placeholder="Location"
                                        variant="filled"
                                        // By setting loccode the user cant delte
                                        value={`${locationCodeToAdd}/${addLocation}`}
                                        onChange={(e) => {
                                            // Error handling needed
                                            const userInput = e.target.value.split(`${locationCodeToAdd}/`)[1]
                                            setAddLocation(userInput)
                                            setFinalLocation(e.target.value)
                                            setError(false)
                                        }}
                                    />
                                </Grid>
                            )}

                            {locationCodeToAdd && (
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => {
                                            handleAddLocationCode()
                                            if (!cookies.location && !cookies.country) {
                                                handlesublocation()
                                            }
                                        }}
                                    >
                                        {/* Add location -> {finalLocation} */}
                                        Add Location
                                    </Button>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                {cookies.location && cookies.country && (
                                    <>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    color="default"
                                                    onChange={() => {
                                                        handleClickOpen()
                                                    }}
                                                    inputProps={{
                                                        'aria-label': 'checkbox with default color',
                                                    }}
                                                />
                                            }
                                            label="Check to remove the previous set information"
                                        />
                                        <Dialog
                                            open={open}
                                            onClose={handleClose}
                                            aria-labelledby="alert-dialog-title"
                                            aria-describedby="alert-dialog-description"
                                        >
                                            <DialogContent>
                                                <DialogContentText id="alert-dialog-description">
                                                    Do you want to clear previous location setting information ?
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleClose} color="primary">
                                                    No
                                                </Button>
                                                <Button onClick={removeCookies} color="primary" autoFocus>
                                                    Yes
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        </>
    )
}

export default AutocompleteLocation
