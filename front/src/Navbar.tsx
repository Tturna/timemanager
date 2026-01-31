import { Link } from "react-router-dom"
import auth from "./auth/auth"
import { useEffect, useRef, useState, type ReactElement } from "react"
import type { User } from "oidc-client-ts"

function Navbar({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {
    const [user, setUser] = useState<User | null>(null)
    const redirectedToLoginRef = useRef(false)

    useEffect(() =>{
        auth.userManager.getUser()
        .then(user => {
            if (!user) {
                if (!redirectedToLoginRef.current) {
                    redirectedToLoginRef.current = true
                    auth.handleLogin(updateStatusMessage)
                }

                return
            }

            setUser(user)
        })
        .catch(_ => {
            updateStatusMessage("Couldn't load logged in user data")
        })
    }, [])

    let userElement: ReactElement | null = null

    if (user) {
        userElement = (
            <>
                <p>Hello {user.profile.preferred_username}</p>
                <button onClick={auth.handleLogout}>Sign out</button>
            </>
        )
    }
    else {
        userElement = (
            <button onClick={() => auth.handleLogin(updateStatusMessage)}>Login</button>
        )
    }

    return (
        <>
        <nav id="navbar">
            <h1>Timepad</h1>
            <Link to="/">Home</Link>
            <Link to="/analytics">Analytics</Link>
            <div className="userElement">{userElement}</div>
        </nav>
        </>
    )
}

export default Navbar
