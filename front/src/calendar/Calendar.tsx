import { useState, useRef, type RefObject } from 'react';
import { type CalendarApi } from '@event-calendar/core'

// Import CSS if your build tool supports it
import '@event-calendar/core/index.css';
import AddEventModal from './AddEventModal';
import useCalendar from './useCalendar';
import { type CalendarEvent } from '@event-calendar/core';
import ExportModal from '../export/ExportModal';

function Calendar({ updateStatusMessage } : { updateStatusMessage: (message: string) => void }) {
    const [isCreatingEvent, setCreatingEvent] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
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
    const { calendarRef, selectionInfoRef } = useCalendar(calendarParentRef, openModal, updateStatusMessage)

    const handleExportPdf = () => {
        setIsExporting(true)
    }


    return (
        <>
        <button onClick={ () => openModal() }>Add</button>
        <button onClick={handleExportPdf}>Export PDF</button>
        <div ref={calendarParentRef} id="calendar"></div>
        {
            isCreatingEvent &&
            calendarRef.current &&
            <AddEventModal
                closeModal={ closeModal }
                selectionInfo={ selectionInfoRef.current } // may be null
                calendarRef={ calendarRef as RefObject<CalendarApi> }
                eventToEdit={ eventToEditRef.current } // may be null
                updateStatusMessage={ updateStatusMessage }
            />
        }

        {
            isExporting && calendarRef.current && <ExportModal
                closeModal={() => setIsExporting(false)}
                updateStatusMessage={updateStatusMessage}
                calendarRef={calendarRef as RefObject<CalendarApi>}
            />
        }
        </>
    )
}

export default Calendar
