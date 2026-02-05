import { useEffect, useState } from "react"
import { getEventTypeHours, getEventTypePercentages } from "./useAnalytics"
import useAuthCheck from "../auth/useAuthCheck"
import type { User } from "oidc-client-ts"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js';
import { Doughnut } from "react-chartjs-2"
import type { EventTypeHoursResult } from "./types/analyticsTypes";

function Analytics(props: {
    updateStatusMessage: (message:string) => void,
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
    useAuthCheck(props)
    const [eventTypeHoursResult, setEventTypeHoursResult] = useState<EventTypeHoursResult | null>(null)
    const [eventTypePercentages, setEventTypePercentages] = useState<Record<string, number> | null>(null)

    useEffect(() => {
        getEventTypeHours()
        .then(ethResult => {
            setEventTypeHoursResult(ethResult)
        })
        .catch(reason => {
            props.updateStatusMessage("Failed to load event data. Try again later or contact the administrator.")
            console.log(reason)
        })

        getEventTypePercentages()
        .then(etp => {
            setEventTypePercentages(etp)
        })
        .catch(reason => {
            props.updateStatusMessage("Failed to load event data. Try again later or contact the administrator.")
            console.log(reason)
        })

        ChartJS.register(ArcElement, Tooltip, Legend, Colors);
    }, [])

    if (!props.user) {
        return <p>Redirecting...</p>
    }

    if (!eventTypeHoursResult || !eventTypePercentages) {
        return <p>Loading...</p>
    }

    const eventTypes = Object.getOwnPropertyNames(eventTypeHoursResult.eventTypeHours)
    let eventHours: number[] = []
    let eventPercentages: number[] = []
    let eventColors: string[] = []

    eventTypes.forEach(key => {
        const perc = Math.round((eventTypePercentages[key]! * 100 + Number.EPSILON) * 100) / 100 
        eventHours.push(Number(eventTypeHoursResult.eventTypeHours[key]!.hours))
        eventPercentages.push(perc)
        eventColors.push(eventTypeHoursResult.eventTypeHours[key]!.color)
    })

    const eventHourDoughnutData = {
        labels: eventTypes,
        datasets: [
            {
                id: 1,
                label: "hours",
                data: eventHours,
                backgroundColor: eventColors
            },
            {
                id: 2,
                label: "percentage %",
                data: eventPercentages,
                backgroundColor: eventColors
            }
        ]
    }

    return (
        <>
        <h1>Analytics</h1>
        <h2>Events</h2>
        <div className="charts">
            <Doughnut data={eventHourDoughnutData} />
        </div>
        </>
    )
}

export default Analytics
