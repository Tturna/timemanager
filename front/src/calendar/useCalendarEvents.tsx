import type { Calendar, CalendarEvent, DisplayMode } from "@event-calendar/core"
import type { RefObject } from "react"
import type { CalendarEventModel } from "../types/api_schema"
import type { AddEventFn, FetchEventsFn } from "./types/calendar_helper_types"

function useCalendarEvents() :
{
    fetchEvents: FetchEventsFn,
    addEvent: AddEventFn,
    syncEventToBackend: (event: CalendarEvent) => Promise<boolean>,
    deleteEvent: (id: string) => Promise<boolean>
} {
    const addEvent: AddEventFn = (calendarRef: RefObject<Calendar | null>, title: string, start: Date, end: Date) => {
        if (!calendarRef.current) return

        const options: RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
        .catch(reason => {
            console.log(reason)
        })

        calendarRef.current.unselect()
    }

    const syncEventToBackend = (event: CalendarEvent) => {
        const options: RequestInit = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: event.title,
                startDateTime: event.start.toISOString(),
                endDateTime: event.end.toISOString()
            })
        }

        const result = fetch(`http://localhost:5167/api/calendar/editevent/${event.id}`, options)
        .then(_ => {
            return true
        })
        .catch(reason => {
            console.log(reason)
            return false
        })

        return result
    }

    const fetchEvents: FetchEventsFn = (_, successCallback: (events: CalendarEvent[]) => void,
        failureCallback: (failureInfo?: any) => void) =>
    {
        fetch("http://localhost:5167/api/calendar/events")
            .then((response: Response) => response.json()
            .then((events: CalendarEventModel[]) => {

                successCallback(events.map((event: CalendarEventModel) => {
                    return {
                        id: event.id,
                        resourceIds: [],
                        allDay: false,
                        start: new Date(event.startDateTime),
                        end: new Date(event.endDateTime),
                        title: event.title,
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
            .catch((reason) => {
                console.log(reason)
                failureCallback()
            }))
    }

    const deleteEvent = (id: string) => {
        const options: RequestInit = {
            method: "DELETE"
        }

        const result = fetch(`http://localhost:5167/api/calendar/deleteevent/${id}`, options)
        .then(_ => true)
        .catch(reason => {
            console.log(reason)
            return false
        })

        return result
    }

    return { fetchEvents, addEvent, syncEventToBackend, deleteEvent }
}

export default useCalendarEvents
