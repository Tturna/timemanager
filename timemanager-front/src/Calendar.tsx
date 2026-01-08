import { useEffect, useRef } from 'react';
import { createCalendar, destroyCalendar, TimeGrid, DayGrid, List } from '@event-calendar/core';
// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';

function Calendar() {
    const calendarRef = useRef<any>(null)
    const calendarParentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        calendarRef.current = createCalendar(
            // HTML element the calendar will be mounted to
            calendarParentRef.current,
            // Array of plugins
            [TimeGrid, DayGrid, List],
            // Options object
            {
                view: 'timeGridWeek',
                events: [
                    // your list of events
                ]
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

    return <div ref={calendarParentRef} id="calendar"></div>
}

export default Calendar
