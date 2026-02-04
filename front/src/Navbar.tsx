import { Link } from "react-router-dom"
import auth from "./auth/auth"
import type { User } from "oidc-client-ts"

function Navbar({ user } : { user: User | null }
) {
    if (!user) return null

    return (
        <>
        <nav id="navbar">
            <h1>Timepad</h1>
            <Link to="/">Home</Link>
            <Link to="/analytics">Analytics</Link>
            <div className="userElement">
                <>
                    <p>Hello {user.profile.preferred_username}</p>
                    <button onClick={auth.handleLogout}>Sign out</button>
                </>
            </div>
        </nav>
        </>
    )
}

export default Navbar
