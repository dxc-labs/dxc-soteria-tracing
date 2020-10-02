import React, { useState } from 'react'
import { Grid, MenuItem, Typography} from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Alert from '@material-ui/lab/Alert'

import { makeStyles } from '@material-ui/core/styles'

export default function Form({ handleSubmit }) {
    const [quantity, setQuantity] = useState('')
    const [template, setTemplate] = useState('')
    const [totalCodes, setTotalCodes] = useState(null)
    const [cols, setCols] = useState(null)
    const [rows, setRows] = useState(null)

    const [xDimension, setXDimension] = useState(null)
    const [yDimension, setYDimension] = useState(null)
    const [verticalMargin, setVerticalMargin] = useState(null)
    const [horizontalMargin, setHorizontalMargin] = useState(null)
	const [error, setError] = useState(false)

    const handleTemplateSelect = (template) => {
        setTemplate(template)

        if (template == '60505_2x4_5x2') {
            setXDimension(4)
            setYDimension(2)
            setVerticalMargin(0.5)
            setHorizontalMargin(0.156)
        } else if (template == '60506_2x2_4x3') {
            setXDimension(2)
            setYDimension(2)
            setVerticalMargin(0.625)
            setHorizontalMargin(0.625)
        } else if (template == 'SingleQR_6x6_1x1') {
            setXDimension(6)
            setYDimension(6)
            setVerticalMargin(2.5)
            setHorizontalMargin(1.25)
        }
    }

    const updateQuantity = (qty) => {
        setQuantity(qty)
        const [rows, cols] = template.split('_')[2].split('x')
        setCols(cols)
        setRows(rows)
        setTotalCodes(qty * (rows * cols))
		if (qty > 10) {
           setError(true)
        } else { 
		   setError(false)
		}
    }

    return (
        <>
            <form>
                <Grid container direction="column" spacing={3}>
                    <Grid item>
                        <TextField
                            label="Template"
                            select
                            fullWidth
                            placeholder="Select Template"
                            variant="filled"
                            value={template}
                            onChange={(e) =>
                                handleTemplateSelect(e.target.value)
                            }
                        >
                            <MenuItem value={'60506_2x2_4x3'}>
                                60506_2x2_4x3
                            </MenuItem>
                            <MenuItem value={'60505_2x4_5x2'}>
                                60505_2x4_5x2
                            </MenuItem>
                            <MenuItem value={'SingleQR_6x6_1x1'}>
                                Single QR
                            </MenuItem>
                        </TextField>
                    </Grid>

                    {template && (
                        <Grid item>
                            <TextField
                                label="Number of Pages(maximum 10 pages)"
                                fullWidth
                                placeholder="Enter # Pages to Print"
                                variant="filled"
                                value={quantity}
								type="number"
                                InputProps={{ inputProps: { min: 1, max: 10 } }}
                                onChange={(e) => updateQuantity(e.target.value)}
                            />
							{error && (
                                <Alert severity="error">
                                    Number of sheets should not be more than 10!
                                </Alert>
                            )}
                        </Grid>
                    )}

                    {totalCodes && (
                        <Grid item>
                            <Typography variant="subtitle1" gutterBottom>
                                This will generate{' '}
                                <b>
                                    {quantity} {quantity > 1 ? 'Pages' : 'Page'}
                                </b>
                                , using a{' '}
                                <b>
                                    {rows}X{cols} template
                                </b>
                                , for a total of <b>{totalCodes} QR codes</b>
                            </Typography>
                        </Grid>
                    )}

                    {totalCodes && (
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() =>
                                    handleSubmit({
                                        quantity: quantity,
                                        template: template,
                                        rows: rows,
                                        cols: cols,
                                        xdim: xDimension,
                                        ydim: yDimension,
                                        tp_bt_mar: verticalMargin,
                                        rt_lt_mar: horizontalMargin,
                                    })
                                }
                            >
                                Generate
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </form>
        </>
    )
}
