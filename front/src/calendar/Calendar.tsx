import { useState, useRef, type RefObject } from 'react';
import { type Calendar } from '@event-calendar/core'

// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import AddEventModal from './AddEventModal';
import useCalendar from './useCalendar';
import { type CalendarEvent } from '@event-calendar/core';

function Calendar() {
    const [isCreatingEvent, setCreatingEvent] = useState(false)
    const eventToEditRef = useRef<CalendarEvent | null>(null)

    const openModal = (eventToEdit?: CalendarEvent) => {
        if (eventToEdit) {
            eventToEditRef.current = eventToEdit
        }

        setCreatingEvent(true)
    }

    const closeModal = () => {
        eventToEditRef.current = null
        setCreatingEvent(false)
    }

    const calendarParentRef = useRef<HTMLDivElement | null>(null)
    const { calendarRef, selectionInfoRef } = useCalendar(calendarParentRef, openModal)

    return (
        <>
        <button onClick={ () => openModal() }>Add</button>
        <div ref={calendarParentRef} id="calendar"></div>
        {
            isCreatingEvent &&
            calendarRef.current &&
            <AddEventModal
                closeModal={ closeModal }
                selectionInfo={ selectionInfoRef.current } // may be null
                calendarRef={ calendarRef as RefObject<Calendar> }
                eventToEdit={ eventToEditRef.current } // may be null
            />
        }
        </>
    )
}

export default Calendar
