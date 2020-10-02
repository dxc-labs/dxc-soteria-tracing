import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App'
import * as serviceWorker from 'serviceWorker'
/*
function getCookie(cname) {
    var name = cname + '='
    var ca = document.cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ''
}
function update_user_scanned_details(user, type, scanId) {
    // API 2

    var apiURL = `${process.env.REACT_APP_API_URL}/checkins`
    var strParams = {
        personId: user,
        scanId: scanId,
        personType: type,
    }

    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        console.log(this.status)

        switch (this.status) {
            case 400:
                displayError()
                break
            case 404:
                ReactDOM.render(<App />, document.getElementById('root'))
                break
            case 201:
                displayTickSymbol()
                break
        }
    }
    xhttp.open('POST', apiURL)
    xhttp.send(JSON.stringify(strParams))
}

function displayTickSymbol() {
    var element = document.getElementById('root')
    element.innerHTML =
        '<div class="content"><div class="header"><img alt="DXC" src="dxc_logo.png" class="dxc_logo"/><label class="alignright"><b>Project Soteria</b></label></div><h3 class="body"><b>Success &#128515;</b></h3><p class="body">Thanks for participating. Your check-in was successful.</p><br><br><center><i style="font-size:24px" class="fa">&#xf087;</i><br><br><br><center><p class="footer">&copy; Project Soteria 2020</font></p></center><p style="color:red">* Disclaimer: Cookies are stored for better user experience</p></br></div>'
}

function displayError() {
    var element = document.getElementById('root')
    element.innerHTML =
        '<div class="content"><div class="header"><img alt="DXC" src="dxc_logo.png" class="dxc_logo"/></div><br><br><center>Your Scan was Unsuccessful <i style="font-size:24px"class="fa">&#x1f44e;</i></center><br><br><center>Please contact your facility admin<br><center><p><font size="1%">&copy; Project Soteria 2020</font></p></center><br><p style="color:red">* Disclaimer: Cookies are stored for better user experience</p></br></div>'
}

var user = getCookie('id')
var type = getCookie('type')
var scanId = document.location.pathname.split('/').slice(-1)[0]
console.log(scanId)
if (user != '' && type === 'EMPLOYEE' && scanId != '') {
    // document.getElementById('root').innerHTML = "<h1>test</h1>"
    update_user_scanned_details(user, type, scanId)
    window.navigator.vibrate(300)
} else {
    ReactDOM.render(<App />, document.getElementById('root'))
}
*/
ReactDOM.render(<App />, document.getElementById('root'))
serviceWorker.register()
