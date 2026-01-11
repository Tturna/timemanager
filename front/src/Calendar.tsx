import { useState, useEffect, useRef } from 'react';
import { createCalendar, destroyCalendar, TimeGrid, DayGrid, List, Interaction,
    type SelectionInfo, type DisplayMode, 
    type FetchInfo,
    type CalendarEvent} from '@event-calendar/core';
// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import AddEventModal from './AddEventModal';

function Calendar() {
    const calendarRef = useRef<any>(null)
    const calendarParentRef = useRef<HTMLDivElement | null>(null)

    const [ isCreatingEvent, setCreatingEvent ] = useState(false)
    const selectionInfoRef = useRef<SelectionInfo | null>(null)

    const dayStrings = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ]

    const dayHeaderFormatter = (date: Date) => {
        return dayStrings[date.getDay()] + ", " + date.getDate() + "." + (date.getMonth() + 1) + "."
    }

    const openModal = () => setCreatingEvent(true)
    const closeModal = () => setCreatingEvent(false)
    const handleSelect = (info: SelectionInfo) => {
        selectionInfoRef.current = info
        openModal()
    }

    const addEvent = (eventType: string, start: Date, end: Date) => {
        const newEvent = {
            id: start.toISOString() + end.toISOString(),
            resourceIds: [],
            allDay: false,
            start,
            end,
            title: eventType,
            editable: true,
            startEditable: true,
            durationEditable: true,
            display: "auto" as DisplayMode,
            classNames: [],
            styles: [],
            extendedProps: []
        }

        calendarRef.current.unselect()
        calendarRef.current.addEvent(newEvent)
        closeModal()
    }

    const fetchEvents = (_: FetchInfo, successCallback: (events: CalendarEvent[]) => void,
        failureCallback: (failureInfo?: any) => void) =>
    {
        console.log("fetching events")

        fetch("http://localhost:5167/api/calendar/events").then((response: Response) => {
            response.json().then((events: {}[]) => {
                console.log("event fetching successful")

                successCallback(events.map((event: any) => {
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
            }).catch((reason) => {
                console.log("json failed")
                console.log(reason)
                failureCallback()
            })
        }).catch((reason) => {
            console.log("fetch failed")
            console.log(reason)
            failureCallback()
        })
    }

    useEffect(() => {
        calendarRef.current = createCalendar(
            // HTML element the calendar will be mounted to
            calendarParentRef.current,
            // Array of plugins
            [TimeGrid, DayGrid, List, Interaction],
            // Options object
            {
                view: 'timeGridWeek',
                eventSources: [{ events: fetchEvents }],
                pointer: true,
                nowIndicator: true,
                selectable: true,
                dayHeaderFormat: dayHeaderFormatter,
                firstDay: 1,
                scrollTime: "06:00:00",
                height: "100%",
                select: handleSelect,
                unselectAuto: false
            }
        );

        // Cleanup function to destroy the calendar when component unmounts
        return () => {
            if (calendarRef.current) {
                destroyCalendar(calendarRef.current)
                calendarRef.current = null
            }
        }
    }, [])

    return (
        <>
        <button onClick={ openModal }>Add</button>
        <div ref={calendarParentRef} id="calendar"></div>
        {
            isCreatingEvent &&
            <AddEventModal
                addEvent={ addEvent }
                closeModal={ closeModal }
                selectionInfo={ selectionInfoRef.current }
                calendar={calendarRef.current}
            />
        }
        </>
    )
}

export default Calendar
