import Calendar from "./calendar/Calendar"

function Home({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {

    return (
        <Calendar updateStatusMessage={updateStatusMessage} />
    )
}

export default Home
