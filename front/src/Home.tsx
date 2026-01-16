import Calendar from "./calendar/Calendar"
import auth from "./auth/auth"
import { useEffect, useRef, useState, type ReactElement } from "react"
import { User } from "oidc-client-ts"
import exporter from "./export/exporter"

function Home({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {
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

    const handleExportPdf = () => {
        exporter.exportEventsPdf(updateStatusMessage)
    }

    return (
        <>
        <h1>Hello testing title</h1>
        {userElement}
        <button onClick={handleExportPdf}>Export PDF</button>
        <Calendar updateStatusMessage={updateStatusMessage} />
        </>
    )
}

export default Home
