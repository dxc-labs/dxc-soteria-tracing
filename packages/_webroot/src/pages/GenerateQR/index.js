import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, CircularProgress, Backdrop, Link } from '@material-ui/core'
import { generateQr } from 'services/api_new'
import Form from './form'

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
    download: {
        textAlign: 'center',
        marginTop: '3rem',
    },
}))

const GenerateQr = () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false)
    const [pdfLink, setPdfLink] = useState(null)
    const [isDone, setIsDone] = useState(false)

    const handleSubmit = (props) => {
		if (props.quantity <= 10) {
           setLoading(true)
		   
           const payload = {
               rows: props.rows,
               cols: props.cols,
               no_sheet: props.quantity,
               xdim: props.xdim,
               ydim: props.ydim,
               tp_bt_mar: props.tp_bt_mar,
               rt_lt_mar: props.rt_lt_mar,
               template: props.template,
           }
           console.log('payload is', payload)
           generateQr(payload).then((link) => {
               setLoading(false)
               const file = new Blob([link], { type: 'application/pdf' })
		   
               const fileURL = URL.createObjectURL(file)
		   
               setPdfLink(fileURL)
               console.log(pdfLink)
               setIsDone(true)
           })
		} else {
			alert('Number of sheets shoubld not be more than 10')
            setLoading(false)
		}
    }

    return (
        <>
            <Backdrop
                className={classes.backdrop}
                open={loading}
                // onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {!isDone ? (
                <>
                    <Typography variant="h3">QR Generator</Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Use this page to generate a PDF with QR Codes
                    </Typography>
                    <Form handleSubmit={handleSubmit} />
                </>
            ) : (
                <>
                    <Typography variant="h3">PDF Generated</Typography>

                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        className={classes.download}
                    >
                        <Link variant="h6" href={pdfLink} target="_blank">
                            Click here to download your PDF.
                        </Link>
                    </Typography>
                </>
            )}
        </>
    )
}

export default GenerateQr
