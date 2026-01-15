import Calendar from "./calendar/Calendar"
import auth from "./auth/auth"
import { useEffect, useState, type ReactElement } from "react"
import { User } from "oidc-client-ts"

function Home({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() =>{
        auth.userManager.getUser()
        .then(user => {
            setUser(user)
        })
        .catch(reason => {
            console.log("Couldn't load logged in user data")
            console.log(reason)
        })
    }, [])

    let userElement: ReactElement | null = null

    if (user) {
        userElement = (
            <div>
                <p>Hello {user.profile.preferred_username}</p>
                <button onClick={auth.handleLogout}>Sign out</button>
            </div>
        )
    }
    else {
        userElement = (
            <button onClick={() => auth.handleLogin(updateStatusMessage)}>Login</button>
        )
    }

    return (
        <>
        <h1>Hello testing title</h1>
        {userElement}
        <Calendar updateStatusMessage={updateStatusMessage} />
        </>
    )
}

export default Home
