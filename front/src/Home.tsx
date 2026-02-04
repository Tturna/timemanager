import type { User } from "oidc-client-ts"
import auth from "./auth/auth"
import Calendar from "./calendar/Calendar"
import { useEffect, useRef } from "react"

function Home({ updateStatusMessage, user, setUser } : {
    updateStatusMessage: (message: string) => void,
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
    const redirectedToLoginRef = useRef(false)

    // TODO: abstract out?
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

    if (!user) {
        return <p>Redirecting...</p>
    }
    else {
        return (
            <Calendar updateStatusMessage={updateStatusMessage} />
        )
    }
}

export default Home
