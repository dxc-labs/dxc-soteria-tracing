import axios from 'axios'

const api = axios.create({
    baseURL: 'https://3ktsfah1re.execute-api.us-east-1.amazonaws.com/prod/',
})

export const getLocations = (qParams = null) => {
    let apiQuery = '/locations/?'

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

export const addLocation = (payload) => {
    payload = JSON.stringify(payload)
    return api
        .post('/locations', payload)
        .then((res) => res.data)
        .catch((err) => console.log(err))
}
