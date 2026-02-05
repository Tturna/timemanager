import { useEffect, useState, type ReactElement } from "react"
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
    let eventTableRows: ReactElement[] = []

    eventTypes.forEach(key => {
        const perc = Math.round((eventTypePercentages[key]! * 100 + Number.EPSILON) * 100) / 100 
        const hours = Number(eventTypeHoursResult.eventTypeHours[key]!.hours)
        eventHours.push(hours)
        eventPercentages.push(perc)
        eventColors.push(eventTypeHoursResult.eventTypeHours[key]!.color)

        eventTableRows.push(
            <tr>
                <td>{key}</td><td>{hours} hours</td><td>{perc} %</td>
            </tr>
        )
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
        <div className="analytics">
            <div>
                <div className="table-container">
                    <table>
                    <tr>
                    <th>Event</th><th>Hours</th><th>Percentage %</th>
                    </tr>
                    { eventTableRows }
                    <tr>
                    <td>
                        <strong>Total time</strong>
                    </td>
                        <td><strong>{eventTypeHoursResult.totalHours} hours</strong>
                    </td>
                    <td>
                        <strong>100 %</strong>
                    </td>
                    </tr>
                    </table>
                </div>
            </div>
            <div>
                <div className="charts">
                    <Doughnut data={eventHourDoughnutData} />
                </div>
            </div>
        </div>
        </>
    )
}

export default Analytics
