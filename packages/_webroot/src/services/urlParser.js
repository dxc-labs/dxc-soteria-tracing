import slugid from 'slugid'

export async function getId(route) {
    // REGEX for SLUGID
    let slug = /[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]/
    let uuid4 = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

    let pathList = route.pathname.split('/')
    let result = ''

    pathList.forEach((path) => {
        if (slug.test(path)) {
            result = path
        } else if (uuid4.test(path)) {
            result = slugid.decode(path)
        }
    })

    return result
}

export async function getIdAsSlug(id) {
    // REGEX for SLUGID
    let slug = /[A-Za-z0-9_-]{8}[Q-T][A-Za-z0-9_-][CGKOSWaeimquy26-][A-Za-z0-9_-]{10}[AQgw]/
    let uuid4 = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

    let result = ''

    if (slug.test(id)) {
        result = id
    } else if (uuid4.test(id)) {
        result = slugid.encode(id)
    }

    return result
}

export async function getTenant() {
    let tenant = window.location.hostname.split('.')[0]
    return tenant
}
