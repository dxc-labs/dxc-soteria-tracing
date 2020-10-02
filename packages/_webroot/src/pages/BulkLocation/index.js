import React, { useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import { Typography, Backdrop, CircularProgress, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ThumbUp, ThumbDown } from '@material-ui/icons'
import { green, red } from '@material-ui/core/colors'
import { bulkLocationUpload } from 'services/api_new'
import CSVReader from 'react-csv-reader'
import Alert from '@material-ui/lab/Alert'
import LocationInputData from 'assets/csvTemplate/LocationInputData.csv'

import { useCookies } from 'react-cookie'
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    input: {
        display: 'none',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
}))
let ext = ''
export default function Form({ handleSubmit }) {
    const [isDone, setIsDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [FileUpload, setFileUpload] = useState('')
    const [error, setError] = useState(false)
    const [Res, setRes] = useState(true)
    const classes = useStyles()
    const [cookies] = useCookies()
    const JsonFormat = (data) => {
        for (var key in data) {
            if (data[key] == null) {
                delete data[key]
            }
        }
        return data
    }
    const FileLoad = (data, fileInfo) => {
        ext = fileInfo.type
        //setExt(fileInfo.type)
        console.log(ext)
        if (ext != 'application/vnd.ms-excel') {
            setError(true)
        } else {
            setError(false)
            let i = ''

            //alert(data.length)
            for (i = 0; i < data.length; i++) {
                if (
                    data[i].country != null &&
                    data[i].state_province != null &&
                    data[i].city != null &&
                    data[i].building != null &&
                    data[i].floor != null &&
                    data[i].sub_location != null
                ) {
                    data[i].country = data[i].country.replace(/\n/g, ' ')
                    data[i].state_province = data[i].state_province.replace(/\n/g, ' ')
                    data[i].city = data[i].city.replace(/\n/g, ' ')

                    data[i].building = data[i].building.replace(/\n/g, ' ')
                    data[i].floor = data[i].floor.toString().replace(/\n/g, ' ')
                    data[i].sub_location = data[i].sub_location.replace(/\n/g, ' ')
                } else {
                    data.splice(i, 1)
                }
                data[
                    i
                ].locationCode = `${data[i].country}#${data[i].state_province}#${data[i].city}#${data[i].building}#${data[i].floor}#${data[i].sub_location}`
                data[i] = JsonFormat(data[i])
                console.log('data is', data[i])
                data[i].timeStamp = new Date().getTime()
                data[i].owner = cookies.id
                delete data[i].country
                delete data[i].state_province
                delete data[i].city
                delete data[i].building
                delete data[i].floor
                delete data[i].sub_location
            }

            setFileUpload(data)
        }
    }
    const papaparseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.toLowerCase().replace(/\W/g, '_'),
    }
    const onUpload = () => {
        if (ext == 'application/vnd.ms-excel') {
            setLoading(true)
            console.log(FileUpload)
            bulkLocationUpload(FileUpload).then((res) => {
                console.log(res)
                setLoading(false)
                setIsDone(true)
                if (res.status != 201) {
                    setRes(false)
                } else {
                    setRes(true)
                }
            })
        } else {
            setLoading(false)

            alert("It's not allowed")
        }
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {!isDone ? (
                <form>
                    <Typography variant="h5">Bulk Location Upload</Typography>
                    <br />
                    <Grid container direction="column" spacing={3}>
                        <Grid item xs={9}>
                            <Typography variant="body2" color="primary" component="span">
                                <Link href={LocationInputData} color="inherit">
                                    Click here for sample CSV template.
                                </Link>
                            </Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <CSVReader
                                multiple
                                type="file"
                                color="primary"
                                id="file"
                                accept=".csv"
                                onFileLoaded={FileLoad}
                                parserOptions={papaparseOptions}
                            />
                            <br />
                            {error && <Alert severity="error">Only csv files are allowed!</Alert>}
                            <label htmlFor="contained-button-file">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    onClick={() => {
                                        onUpload()
                                    }}
                                >
                                    Upload
                                </Button>
                            </label>
                        </Grid>
                    </Grid>
                </form>
            ) : Res ? (
                <>
                    <Typography variant="h4">Upload successful &#128515;</Typography>

                    <Grid container justify="center">
                        <ThumbUp style={{ color: green[500] }} className={classes.icon} />
                    </Grid>
                </>
            ) : (
                <>
                    <Typography variant="h3">Whops :(</Typography>

                    <Typography variant="subtitle1" gutterBottom>
                        Something has gone wrong... Please try again
                    </Typography>

                    <Grid container justify="center">
                        <ThumbDown style={{ color: red[500] }} className={classes.icon} />
                    </Grid>
                </>
            )}
        </>
    )
}
