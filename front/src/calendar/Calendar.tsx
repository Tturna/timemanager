import { useState, useRef, type RefObject, useEffect } from 'react';
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

    useEffect(() => {
        // Buttons are added to calendar as options in useCalendar. This is required to
        // populate the buttons.
        let addEventButton: Element | undefined 
        let exportButton: Element | undefined
        const addEventHandler = () => openModal()

        if (calendarParentRef.current) {
            addEventButton = calendarParentRef.current.getElementsByClassName("ec-add")[0]
            exportButton = calendarParentRef.current.getElementsByClassName("ec-export")[0]

            if (addEventButton) {
                addEventButton.textContent = "Add Event"
                addEventButton.addEventListener("click", addEventHandler)
            }

            if (exportButton) {
                exportButton.textContent = "Export PDF"
                exportButton.addEventListener("click", handleExportPdf)
            }
        }

        return () => {
            if (addEventButton) {
                addEventButton.removeEventListener("click", addEventHandler)
            }

            if (exportButton) {
                exportButton.removeEventListener("click", handleExportPdf)
            }
        }
    }, [calendarRef.current])

    return (
        <>
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
