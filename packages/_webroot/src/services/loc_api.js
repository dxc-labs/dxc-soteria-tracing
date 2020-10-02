import axios from 'axios'

const api = axios.create({
    baseURL: 'https://c3a43zusb1.execute-api.us-east-2.amazonaws.com/dev/m2m_RTW_FDB_map',
    //headers: { Tenant: 'dxc' },
})

export function getSiteCode(payload) {
  return api
    .post('',{"region_name":payload})
    .then((res) => res.data)
    .catch((err) => err);
}

export function getLocationdetail(payload) {
  return api
    .post('',{"site_code":payload,"isActive": "N"})
    .then((res) => res.data)
    .catch((err) => err);
}

