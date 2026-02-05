import auth from "../auth/auth"
import useCalendarEvents from "../calendar/useCalendarEvents"
import type { CalendarEventModel } from "../types/api_schema"
import type { EventTypeHoursResult } from "./types/analyticsTypes"

export function getEventTypeHours() {
    const { fetchEventsWithUser } = useCalendarEvents()

    return new Promise<EventTypeHoursResult>((resolve, reject) => {
        auth.userManager.getUser()
        .then(user => {
            if (user == null) {
                reject("Couldn't load logged in user data. Try again later or contact the administrator.")
                return
            }

            fetchEventsWithUser(user)
            .then(events => {
                let eventTypeHours = {}
                let totalHours = 0

                for (let i = 0; i < events.length; i++) {
                    const event = events[i] as CalendarEventModel
                    const startDate = new Date(event.startDateTime)
                    const endDate = new Date(event.endDateTime)
                    // @ts-expect-error
                    const diffMs = endDate - startDate
                    const diffHours = diffMs / 1000 / 60 / 60

                    totalHours += diffHours

                    if (Object.hasOwn(eventTypeHours, event.eventType.name)) {
                        // @ts-expect-error
                        eventTypeHours[event.eventType.name] += diffHours
                    }
                    else {
                        Object.defineProperty(eventTypeHours, event.eventType.name, {
                            value: diffHours,
                            writable: true
                        })
                    }
                }

                var keys = Object.getOwnPropertyNames(eventTypeHours)

                for (let i = 0; i < keys.length; i++) {
                    // @ts-expect-error
                    const hours = eventTypeHours[keys[i]]
                    // @ts-expect-error
                    eventTypeHours[keys[i]] = hours.toString()
                }

                const result = {
                    eventTypeHours,
                    totalHours
                } satisfies EventTypeHoursResult

                resolve(result)
            })
            .catch(_ => {
                reject("Failed to export PDF. Try again later or contact the administrator.")
            })
        })
        .catch(_ => {
            reject("Couldn't load logged in user data. Try again later or contact the administrator.")
        })
    })
}

export function getEventTypePercentages() {
    const { fetchEventsWithUser } = useCalendarEvents()

    return new Promise<{}>((resolve, reject) => {
        auth.userManager.getUser()
        .then(user => {
            if (user == null) {
                reject("Couldn't load logged in user data. Try again later or contact the administrator.")
                return
            }

            fetchEventsWithUser(user)
            .then(events => {
                let eventTypeHours = {}
                let totalHours = 0

                for (let i = 0; i < events.length; i++) {
                    const event = events[i] as CalendarEventModel
                    const startDate = new Date(event.startDateTime)
                    const endDate = new Date(event.endDateTime)
                    // @ts-expect-error
                    const diffMs = endDate - startDate
                    const diffHours = diffMs / 1000 / 60 / 60

                    totalHours += diffHours

                    if (Object.hasOwn(eventTypeHours, event.eventType.name)) {
                        // @ts-expect-error
                        eventTypeHours[event.eventType.name] += diffHours
                    }
                    else {
                        Object.defineProperty(eventTypeHours, event.eventType.name, {
                            value: diffHours,
                            writable: true
                        })
                    }
                }

                var keys = Object.getOwnPropertyNames(eventTypeHours)
                let eventTypePercentages = {}

                for (let i = 0; i < keys.length; i++) {
                    // @ts-expect-error
                    const hours = eventTypeHours[keys[i]]

                    Object.defineProperty(eventTypePercentages, keys[i] as string, {
                        value: hours / totalHours,
                        writable: false
                    })
                }

                resolve(eventTypePercentages)
            })
            .catch(_ => {
                reject("Failed to export PDF. Try again later or contact the administrator.")
            })
        })
        .catch(_ => {
            reject("Couldn't load logged in user data. Try again later or contact the administrator.")
        })
    })
}
