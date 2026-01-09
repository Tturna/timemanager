import { useEffect, useRef } from 'react';
import { createCalendar, destroyCalendar, TimeGrid, DayGrid, List, Interaction, type Event } from '@event-calendar/core';
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

    const dayStrings = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ]

    const monthStrings = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"
    ]

    const dayHeaderFormatter = (date: Date) => {
        return dayStrings[date.getDay()] + ", " + date.getDate() + "." + (date.getMonth() + 1) + "."
    }

    const addEvent = () => {
        let prev = eventsRef.current.at(-1)

        if (!prev) return

        const newStart = new Date(prev.start)
        const newEnd = new Date(prev.end)
        newStart.setDate(newStart.getDate() + 1)
        newEnd.setDate(newEnd.getDate() + 1)

        const newEvent = {
            ...prev,
            id: (parseInt(prev.id) + 1).toString(),
            start: newStart,
            end: newEnd
        }

        eventsRef.current.push(newEvent)
        calendarRef.current.addEvent(newEvent)
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
                events: eventsRef.current,
                pointer: true,
                nowIndicator: true,
                selectable: true,
                dayHeaderFormat: dayHeaderFormatter,
                firstDay: 1
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
