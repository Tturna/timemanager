import type { User } from "oidc-client-ts"
import Calendar from "./calendar/Calendar"
import useAuthCheck from "./auth/useAuthCheck"

function Home(props : {
    updateStatusMessage: (message: string) => void,
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
    useAuthCheck(props)

    if (!props.user) {
        return <p>Redirecting...</p>
    }
    else {
        return (
            <Calendar updateStatusMessage={props.updateStatusMessage} />
        )
    }
}

export default Home
