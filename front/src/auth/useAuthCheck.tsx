import { useEffect, useRef } from "react"
import auth from "./auth"
import type { User } from "oidc-client-ts"

function useAuthCheck({ updateStatusMessage, user, setUser } : {
    updateStatusMessage: (message: string) => void,
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
    const redirectedToLoginRef = useRef(false)

    useEffect(() => {
        auth.userManager.getUser()
        .then(currentUser => {
            if (!currentUser) {
                setUser(null)

                if (!redirectedToLoginRef.current) {
                    redirectedToLoginRef.current = true
                    auth.handleLogin(updateStatusMessage)
                }

                return
            }

            if (user != currentUser) {
                setUser(currentUser)
            }
        })
        .catch(_ => {
            updateStatusMessage("Couldn't load logged in user data")
        })

    }, [])
}

export default useAuthCheck
