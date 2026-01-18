import type { CalendarApi, CalendarEvent, DisplayMode } from "@event-calendar/core"
import type { RefObject } from "react"
import type { CalendarEventModel, EventTypeModel } from "../types/api_schema"
import type { AddEventFn, UpdateCalendarInterfaceEventsFn } from "./types/calendar_helper_types"
import auth from "../auth/auth"
import type { User } from "oidc-client-ts"

function useCalendarEvents(updateStatusMessage: (message: string) => void) :
{
    fetchEvents: (failureCallback?: () => void) => Promise<CalendarEventModel[]>,
    fetchEventsWithUser: (user: User, failureCallback?: () => void) => Promise<CalendarEventModel[]>,
    fetchEventTypes: () => Promise<EventTypeModel[]>,
    updateCalendarInterfaceEvents: UpdateCalendarInterfaceEventsFn,
    addEvent: AddEventFn,
    syncEventToBackend: (event: CalendarEvent) => Promise<boolean>,
    deleteEvent: (id: string) => Promise<boolean>
} {
    const addEvent: AddEventFn = (
        calendarRef: RefObject<CalendarApi | null>,
        title: string,
        start: Date, end: Date
    ) => {
        if (!calendarRef.current) return

        auth.userManager.getUser()
        .then(user => {
            if (user == null) {
                // User probably not authenticated
                updateStatusMessage("You must sign in to add events")
                return
            }

            const options: RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.access_token}`
                },
                body: JSON.stringify({
                    title,
                    startDateTime: start.toISOString(),
                    endDateTime: end.toISOString()
                })
            }

            fetch("http://localhost:5167/api/calendar/addevent", options)
                .then((response: Response) => response.json())
                .then((createdEvent: CalendarEventModel) => {
                    if (!calendarRef.current) return

                        const newEvent = {
                            id: createdEvent.id,
                            resourceIds: [],
                            allDay: false,
                            start,
                            end,
                            title: title,
                            editable: true,
                            startEditable: true,
                            durationEditable: true,
                            display: "auto" as DisplayMode,
                            classNames: [],
                            styles: [],
                            extendedProps: []
                        } as CalendarEvent

                        calendarRef.current.addEvent(newEvent)
                })
                .catch(_ => {
                    updateStatusMessage("Failed to add event. Try again later or contact the administrator.")
                })
        })
        .catch(_ => {
            updateStatusMessage("Couldn't load logged in user data.")
        })

        calendarRef.current.unselect()
    }

    const syncEventToBackend = (event: CalendarEvent) => {
        return auth.userManager.getUser()
        .then(user => {
            if (user == null) {
                updateStatusMessage("Couldn't load logged in user data.")
                return false
            }

            const options: RequestInit = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.access_token}`
                },
                body: JSON.stringify({
                    title: event.title,
                    startDateTime: event.start.toISOString(),
                    endDateTime: event.end.toISOString()
                })
            }

            return fetch(`http://localhost:5167/api/calendar/editevent/${event.id}`, options)
                .then(_ => {
                return true
            })
            .catch(_ => {
                updateStatusMessage("Failed to update events. Try again later or contact the administrator.")
                return false
            })
        })
        .catch(_ => {
            updateStatusMessage("Couldn't load logged in user data.")
            return false
        })
    }

    const fetchEventsWithUser = (user: User, failureCallback?: () => void) => {
        const requestOptions: RequestInit = {
            headers: {
                Authorization: `Bearer ${user.access_token}`
            }
        }

        return fetch("http://localhost:5167/api/calendar/events", requestOptions)
        .then((response: Response) => response.json())
        .then((events: CalendarEventModel[]) => {
            return events
        })
        .catch(_ => {
            updateStatusMessage("Failed to get events. Try again later or contact the administrator.")
            if (failureCallback) failureCallback()
            throw new Error("Failed to get events. Try again later or contact the administrator.")
        })
    }

    const fetchEvents = (failureCallback?: () => void) => {
        const promise: Promise<CalendarEventModel[]> = new Promise((resolve, reject) => {
            auth.userManager.getUser()
            .then(user => {
                if (user == null) {
                    // User probably not authenticated
                    if (failureCallback) failureCallback()
                    reject("Couldn't load logged in user data.")
                    return
                }

                fetchEventsWithUser(user, failureCallback)
                .then(events => {
                    resolve(events)
                })
                .catch(error => {
                    reject(error)
                    return
                })
            })
            .catch(_ => {
                updateStatusMessage("Couldn't load logged in user data.")
                if (failureCallback) failureCallback()
                reject("Couldn't load logged in user data.")
                return
            })
        })

        return promise
    }

    const fetchEventTypes = () => {
        return new Promise<EventTypeModel[]>((resolve, reject) => {
            auth.userManager.getUser()
            .then(user => {
                if (user == null) {
                    updateStatusMessage("Couldn't load logged in user data.")
                    reject("Couldn't load logged in user data.")
                    return
                }

                const requestOptions: RequestInit = {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`
                    }
                }

                fetch("http://localhost:5167/api/calendar/eventtypes", requestOptions)
                .then((response: Response) => response.json())
                .then((eventTypes: EventTypeModel[]) => {
                    resolve(eventTypes)
                })
                .catch(_ => {
                    updateStatusMessage("Failed to get event types. Try again later or contact the administrator.")
                    reject("Failed to get event types. Try again later or contact the administrator.")
                })

            })
            .catch(_ => {
                updateStatusMessage("Couldn't load logged in user data.")
                reject("Couldn't load logged in user data.")
            })
        })
    }

    const updateCalendarInterfaceEvents: UpdateCalendarInterfaceEventsFn = (
        _,
        successCallback: (events: CalendarEvent[]) => void,
        failureCallback: (failureInfo?: any) => void
    ) => {
        fetchEvents(failureCallback)
        .then(events => {
            successCallback(events.map((event: CalendarEventModel) => {
                return {
                    id: event.id,
                    resourceIds: [],
                    allDay: false,
                    start: new Date(event.startDateTime),
                    end: new Date(event.endDateTime),
                    title: event.eventType.name,
                    editable: true,
                    startEditable: true,
                    durationEditable: true,
                    display: "auto" as DisplayMode,
                    classNames: [],
                    styles: [],
                    extendedProps: []
                } as CalendarEvent
            }))
        })
    }

    const deleteEvent = (id: string) => {
        return auth.userManager.getUser()
        .then(user => {
            if (user == null) {
                // User probably not authenticated
                return false
            }

            const options: RequestInit = {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.access_token}`
                }
            }

            return fetch(`http://localhost:5167/api/calendar/deleteevent/${id}`, options)
                .then(_ => true)
            .catch(_ => {
                updateStatusMessage("Failed to delete. Try again later or contact the administrator.")
                return false
            })
        })
        .catch(_ => {
            updateStatusMessage("Couldn't load logged in user data.")
            return false
        })
    }

    return {
        fetchEvents,
        fetchEventsWithUser,
        fetchEventTypes,
        updateCalendarInterfaceEvents,
        addEvent,
        syncEventToBackend,
        deleteEvent }
}

export default useCalendarEvents
