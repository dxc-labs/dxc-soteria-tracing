import { Auth } from 'aws-amplify'

let cognitoUser = null

export async function signIn(email) {
    try {
        cognitoUser = await Auth.signIn(email)
        return true
    } catch (error) {
        return false
    }
}

// export async function signOut() {
//     try {
//         await Auth.signOut({ global: true })
//         document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
//     } catch (error) {
//         console.log('error signing out: ', error)
//     }
// }

export async function answerCustomChallenge(answer) {
    cognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, answer)
    return isAuthenticated()
}

export async function getPublicChallengeParameters() {
    return cognitoUser.challengeParam
}

export async function signUp(email) {
    const params = {
        username: email,
        password: getRandomString(30),
        attributes: {
            name: email,
        },
    }

    await Auth.signUp(params)
}

function getRandomString(bytes) {
    const randomValues = new Uint8Array(bytes)
    window.crypto.getRandomValues(randomValues)
    return Array.from(randomValues).map(intToHex).join('')
}

function intToHex(nr) {
    return nr.toString(16).padStart(2, '0')
}

export async function isAuthenticated() {
    try {
        await Auth.currentSession()
        return true
    } catch {
        return false
    }
}

export async function getUserDetails() {
    if (!cognitoUser) {
        cognitoUser = await Auth.currentAuthenticatedUser()
    }
    return await Auth.userAttributes(cognitoUser)
}

export async function getCurrentUser() {
    if (!cognitoUser) {
        cognitoUser = await Auth.currentAuthenticatedUser()
    }
    return cognitoUser
}

export function hasCookie() {
    if (document.cookie.split('; ').find((row) => row.startsWith('id'))) {
        return true
    } else {
        return false
    }
}
