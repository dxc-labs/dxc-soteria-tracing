import React, { useState } from 'react'
import { Grid,TextField, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Table from 'components/Table'
import { Backdrop, CircularProgress } from '@material-ui/core'
import { getCheckins } from 'services/api_new'

const columns = [
    { title: 'CheckIn Time', field: 'sk' },
    { title: 'Location Code', field: 'locationCode' },
]
const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
}))

export default function Tracing() {
    const [uuid, setuuid] = useState('')
    const [isDone, setIsDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [toDate, setTo] = useState('')
    const [fromDate, setFrom] = useState('')
    const [apiTable, setApiTable] = useState(false)
    const [ToData, setToData] = useState(false)
    const [locations, setLocations] = useState([])
    const classes = useStyles()
    let timeTo = ''
    let timeFrom = ''
    let formatDateTo = ''
    let formatDateFrom = ''
    let tempDate = ''
    const FormatDate = (date) => {
        let temp = new Date(date)

        let formatDate = `${temp.getFullYear()}-${(
            '0' +
            (temp.getMonth() + 1)
        ).slice(-2)}-${temp.getDate()}`
        return formatDate
    }
    const fromDateFunction = (data) => {
        tempDate = new Date(data)
        console.log(tempDate)
        console.log(new Date())
        if (tempDate.getDate() != new Date().getDate()) {
            setToData(true)
        } else {
            setToData(false)
            setTo(data)
        }
    }
    const handleSubmit = () => {
        setLoading(true)
        setIsDone(true)
        timeTo = new Date(toDate + ' 12:00:00').toUTCString()
        timeFrom = new Date(fromDate + ' 12:00:00').toUTCString()

        console.log(uuid, timeTo, timeFrom)
        formatDateTo = FormatDate(timeTo)
        formatDateFrom = FormatDate(timeFrom)
        console.log(uuid, formatDateFrom, formatDateTo)

        getCheckins({ q: uuid, from: formatDateFrom, to: formatDateTo }).then(
            (locations) => {
                if (locations.length > 0) {
                    setLocations(locations)
                    setApiTable(true)
                } else {
                    setApiTable(false)
                }

                setLoading(false)
            }
        )
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {!isDone && !loading && (
                <form>
                    <Grid container direction="column" spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Employee UUID"
                                fullWidth
                                placeholder="Employee UUID"
                                variant="filled"
                                value={uuid}
                                onChange={(e) => {
                                    setuuid(e.target.value)
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="date"
                                label="From"
                                type="date"
                                defaultValue=""
                                onChange={(e) => {
                                    setFrom(e.target.value)
                                    fromDateFunction(e.target.value)
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            {ToData && (
                                <TextField
                                    id="date"
                                    label="To"
                                    type="date"
                                    defaultValue=""
                                    onChange={(e) => {
                                        setTo(e.target.value)
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            )}
                        </Grid>

                        <Grid
                            container
                            spacing={3}
                            justify="center"
                            alignItems="center"
                        >
                            <Grid item xs={9}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => handleSubmit()}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            )}
            {apiTable && isDone && !loading && (
                <Table
                    columns={columns}
                    data={locations}
                    //actions={actions}
                    title="Locations"
                />
            )}
        </>
    )
}
