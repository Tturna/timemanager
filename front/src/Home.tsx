import Calendar from "./calendar/Calendar"

function Home({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {

    return (
        <>
        <h1>Timepad</h1>
        <Calendar updateStatusMessage={updateStatusMessage} />
        </>
    )
}

export default Home
