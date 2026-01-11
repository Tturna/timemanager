import { useState, useRef } from 'react';

// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import AddEventModal from './AddEventModal';
import useCalendar from './useCalendar';

function Calendar() {
    const [isCreatingEvent, setCreatingEvent] = useState(false)

    const openModal = () => setCreatingEvent(true)
    const closeModal = () => setCreatingEvent(false)

    const calendarParentRef = useRef<HTMLDivElement | null>(null)
    const { calendarRef, selectionInfoRef } = useCalendar(calendarParentRef, openModal)

    return (
        <>
        <button onClick={ openModal }>Add</button>
        <div ref={calendarParentRef} id="calendar"></div>
        {
            isCreatingEvent &&
            calendarRef.current &&
            <AddEventModal
                closeModal={ closeModal }
                selectionInfo={ selectionInfoRef.current }
                calendarRef={ calendarRef }
            />
        }
        </>
    )
}

export default Calendar
