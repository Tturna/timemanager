import { useEffect, useState, type ReactElement } from "react"
import { getEventTypeHours, getEventTypePercentages } from "./useAnalytics"

function Analytics({ updateStatusMessage }: { updateStatusMessage: (message:string) => void }) {
    const [eventTypeHours, setEventTypeHours] = useState<{} | null>(null)
    const [eventTypePercentages, setEventTypePercentages] = useState<{} | null>(null)

    useEffect(() => {
        getEventTypeHours()
        .then(eth => {
            setEventTypeHours(eth)
        })
        .catch(_ => {
            updateStatusMessage("Failed to load event data. Try again later or contact the administrator.")
        })

        getEventTypePercentages()
        .then(etp => {
            setEventTypePercentages(etp)
        })
        .catch(_ => {
            updateStatusMessage("Failed to load event data. Try again later or contact the administrator.")
        })
    }, [])

    let eventHourElements: ReactElement[] = []
    let eventPercentageElements: ReactElement[] = []

    if (eventTypeHours) {
        eventHourElements = Object.getOwnPropertyNames(eventTypeHours).map(key => {
            // @ts-expect-error
            return <p key={key}><strong>{key}</strong> - {eventTypeHours[key]} hours</p>
        })
    }

    if (eventTypePercentages) {
        eventPercentageElements = Object.getOwnPropertyNames(eventTypePercentages).map(key => {
            // @ts-expect-error
            const perc = Math.round((eventTypePercentages[key] * 100 + Number.EPSILON) * 100) / 100 
            return <p key={key}><strong>{key}</strong> - {perc} %</p>
        })
    }

    return (
        <>
        <h1>Analytics</h1>
        <h2>Events</h2>
        { eventPercentageElements.length > 0 ? eventPercentageElements : <p>Loading...</p> }
        { eventHourElements.length > 0 ? eventHourElements : <p>Loading...</p> }
        </>
    )
}

export default Analytics
