import { useEffect, useRef } from 'react';
import { createCalendar, destroyCalendar, TimeGrid, DayGrid, List, type Event } from '@event-calendar/core';
// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';

function Calendar() {
    const calendarRef = useRef<any>(null)
    const calendarParentRef = useRef<HTMLDivElement | null>(null)
    const eventsRef = useRef<Event[]>(
        [
            {
                id: "1",
                resourceIds: [],
                allDay: false,
                start: new Date(2026, 0, 5, 8, 30),
                end: new Date(2026, 0, 5, 15),
                title: "My Title",
                display: "auto",
                classNames: [],
                styles: [],
                extendedProps: {}
            }
        ]
    )

    const addEvent = () => {
        let prev = eventsRef.current.at(-1)

        if (!prev) return

        let newStart = new Date(prev.start)
        let newEnd = new Date(prev.end)
        newStart.setDate(newStart.getDate() + 1)
        newEnd.setDate(newEnd.getDate() + 1)

        eventsRef.current.push({
            ...prev,
            id: (parseInt(prev.id) + 1).toString(),
            start: newStart,
            end: newEnd
        })

        calendarRef.current.setOption("events", eventsRef.current)
    }

    useEffect(() => {
        calendarRef.current = createCalendar(
            // HTML element the calendar will be mounted to
            calendarParentRef.current,
            // Array of plugins
            [TimeGrid, DayGrid, List],
            // Options object
            {
                view: 'timeGridWeek',
                events: eventsRef.current
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
        <button onClick={addEvent}>Add</button>
        <div ref={calendarParentRef} id="calendar"></div>
        </>
    )
}

export default Calendar
