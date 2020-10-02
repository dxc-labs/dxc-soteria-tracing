import axios from 'axios'

const api = axios.create({
     baseURL: `https://${process.env.REACT_APP_API_URL}/tracing`,
   
})
const apiqr = axios.create({
    headers: { Accept: 'application/pdf' },
    baseURL: `https://${process.env.REACT_APP_API_URL}/tracing`,
   

    responseType: 'blob',
})

export const getLocations = (qParams = null) => {
    let apiQuery = 'locations/?'

    if (qParams) {
        for (let param in qParams) {
            apiQuery = `${apiQuery}${param}=${qParams[param]}&`
        }
    }

    return api
        .get(apiQuery)
        .then((res) => res.data)
        .catch((err) => err)
}
export const patchLocation = (payload, id) => {
    payload = JSON.stringify(payload)
    return api
        .patch(`/locations/${id}`, payload)
        .then((res) => res)
        .catch((err) => console.log(err))
}
export const adduser = (payload) => {
    payload = JSON.stringify(payload)
    return api
        .post('/users', payload)
        .then((res) => res)
        .catch((err) => console.log(err))
}

export function getLocation(id) {
    return api
        .get(`/locations/${id}`)
        .then((res) => res)
        .catch((err) => {
            console.log(err)
            if (err == 'Error: Network Error') {
                return 'network error'
            } else {
                return err.response.status
            }
        })
}

export function addUserCheckins(userId, locationId) {
    const payload = {
        locationId: locationId,
    }

    return api
        .post(`/users/${userId}/checkins`, payload)
        .then((res) => res)
        .catch((err) => {
            if (err == 'Error: Network Error') {
                return 'network error'
            } else {
                return err.response.status
            }
        })
}

export function addUserCheckouts(userId, locationId) {
    const payload = {
        locationId: locationId,
    }

    return api
        .post(`/users/${userId}/checkouts`, payload)
        .then((res) => res)
        .catch((err) => {
            if (err == 'Error: Network Error') {
                return 'network error'
            } else {
                return err.response.status
            }
        })
}
export function addCleaners(userId, locationId) {
    const payload = {
        locationId: locationId,
    }

    return api
        .post(`/users/${userId}/sanitizations`, payload)
        .then((res) => res)
        .catch((err) => {
            if (err == 'Error: Network Error') {
                return 'network error'
            } else {
                return err.response.status
            }
        })
}

export function generateQr(payload) {
    return apiqr
        .post(`/qr`, payload)
        .then((res) => res.data)
        .catch((err) => err)
}
export function bulkLocationUpload(payload) {
    return api
        .post(`/locations`, payload)
        .then((res) => res)
        .catch((err) => err)
}
