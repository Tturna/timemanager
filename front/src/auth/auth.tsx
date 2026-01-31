import { UserManager, type UserManagerSettings } from 'oidc-client-ts'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { URLS } from '../util/urls'

const userManagerSettings: UserManagerSettings = {
    authority: URLS.makeAuthorityUrl(),
    client_id: "public-client",
    metadataUrl: URLS.makeMetadataUrl(),
    redirect_uri: URLS.makePostLoginRedirectUrl(),
    post_logout_redirect_uri: URLS.makePostLogoutRedirectUrl(),
    automaticSilentRenew: true
}

const userManager = new UserManager(userManagerSettings)

function handleLogin(updateStatusMessage: (message: string) => void) {
    // This fetch is effectively a pre-flight health check. This is used to set a status message
    // because signinRedirect() causes a full refresh, wiping React state.
    fetch(URLS.makeMetadataUrl())
    .then((response: Response) => {
        if (!response.ok) {
            updateStatusMessage("Sign in failed. Try again later or contact the administrator.")
            return
        }

        // This function will redirect no matter what. Don't rely on the catch() method
        // for setting React state like status messages for example
        userManager.signinRedirect()
    })
    .catch(_ => {
        updateStatusMessage("Sign in failed. Try again later or contact the administrator.")
    })
}

function handleLogout() {
    userManager.signoutRedirect()
}

function LoginCallback({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {
    const callbackCalled = useRef(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Prevent React StrictMode from calling the signin callback multiple times
        if (callbackCalled.current) return

        callbackCalled.current = true

        userManager.signinCallback()
        .then(_ => {
            navigate("/")
        })
        .catch(_ => {
            updateStatusMessage("Error while handling sign in. If you encounter problems, try again later or contact the administrator.")
            navigate("/")
        })
    }, [])

    return <div>Processing signin...</div>
}

export default { userManager, LoginCallback, handleLogin, handleLogout }
