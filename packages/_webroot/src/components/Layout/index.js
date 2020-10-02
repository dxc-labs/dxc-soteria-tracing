import React from 'react'
import logo from 'assets/images/dxc_logo.png'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Paper, Grid } from '@material-ui/core'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import { hasCookie } from 'services/Authentication'
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import { useCookies } from 'react-cookie'

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(2),
        padding: theme.spacing(1),
    },
    icon: {
        fontSize: '5rem',
        margin: theme.spacing(5),
        padding: theme.spacing(5),
    },
    pre: {
        // whiteSpace: 'pre-wrap',
        width: '100%',
        // whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
    logo: {
        backgroundColor: 'black',
        color: 'white',

        marginTop: '10px',
        border: 'none',
        alignContent: 'middle',
    },
    logoMinMax: {
        maxWidth: '200px',
        minWidth: '100px',
        minHeight: '10px',
        height: '10%',
        width: '40%',
    },
    alignright: {
        padding: '5px 6px 10px 10px',
        display: 'inline-block',
        float: 'right',
        verticalAlign: 'middle',
        fontSize: '13px',
    },
    footer: {
        paddingBottome: '5px',
        paddingTop: '20px',
        textAlign: 'center',
    },

    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(3),
    },
    title: {
        flexGrow: 1,
    },
    menuList: {
      marginLeft:'20px',
      backgroundColor:'white',
      color:'black',
      
    },
    menuItem:{
        minHeight:'0px',
        fontSize:'0.9rem',
        
    }
}))

const Layout = ({ children }) => {
    const classes = useStyles()
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])
    const maxAge = 365 * 24 * 60 * 60
    const expires = new Date()
    expires.setDate(expires.getDate() + 365)
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
      };
    
      const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }
    
        setOpen(false);
      };

    const handleCookies = () => {
        removeCookie('type', {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        removeCookie('id', {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        window.location.reload()
    }

    return (
        <>
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12} sm={9} m={6} lg={6} xl={5}>
                    <Paper className={classes.paper} elevation={5}>
                        <AppBar position="static">
                            <Toolbar>
                                {hasCookie()&&<IconButton
                                    edge="start"
                                    className={classes.menuButton}
                                    color="inherit"
                                    aria-label="menu"
                                    ref={anchorRef}
                                    aria-controls={open ? 'menu-list-grow' : undefined}
                                    aria-haspopup="true"
                                    onClick={handleToggle}
                                >
                                    <MenuIcon></MenuIcon></IconButton>}
                                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                        {...TransitionProps}
                                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                                        >
                                       <ClickAwayListener onClickAway={handleClose}>
                                        <Paper elevation={3} square className={classes.menuList}>
                                        
                                            
                                                <MenuItem onClick={handleClose} className={classes.menuItem}>Profile</MenuItem>
                                                <MenuItem onClick={handleClose,handleCookies} className={classes.menuItem}>Logout</MenuItem>
                                            
                                          
                                        </Paper>
                                        </ClickAwayListener>
                                        </Grow>
                                    )}
                                    </Popper>
                                <Typography variant="h6" className={classes.title}>
                                    <div className={classes.logo}>
                                        <img alt="Project Soteria" src={logo} className={classes.logoMinMax} />
                                        <Typography className={classes.alignright} variant="subtitle1">
                                            Project Soteria
                                        </Typography>
                                    </div>
                                </Typography>
                            </Toolbar>
                        </AppBar>

                        {children}
                        <Typography className={classes.footer} variant="subtitle1">
                            &copy; Project Soteria 2020
                        </Typography>
                        <Typography className={classes.footer} variant="subtitle1" color="error">
                            * Disclaimer: Cookies are stored for better user experience
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default Layout
