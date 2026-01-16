import { createCalendar, destroyCalendar, DayGrid, Interaction, List, TimeGrid,
    type CalendarApi, type SelectionInfo, type EventDropInfo,
    type EventResizeInfo,
    type EventClickInfo,
    type CalendarEvent} from "@event-calendar/core";
import { useEffect, useRef, type RefObject } from "react";
import useCalendarEvents from "./useCalendarEvents";

function useCalendar(
    calendarParentRef: RefObject<HTMLElement | null>,
    openModal: (eventToEdit?: CalendarEvent) => void,
    updateStatusMessage: (message: string) => void
) : {
    calendarRef: RefObject<CalendarApi | null>,
    selectionInfoRef: RefObject<SelectionInfo | null>
} {
    const calendarRef = useRef<CalendarApi | null>(null)
    const selectionInfoRef = useRef<SelectionInfo | null>(null)
    const { updateCalendarInterfaceEvents, syncEventToBackend } = useCalendarEvents(updateStatusMessage)

    const dayStrings = [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ]

    const dayHeaderFormatter = (date: Date) => {
        // TODO: Consider Intl.DateTimeFormat ?
        return dayStrings[date.getDay()] + ", " + date.getDate() + "." + (date.getMonth() + 1) + "."
    }

    const handleSelect = (info: SelectionInfo) => {
        selectionInfoRef.current = info
        openModal()
    }

    const handleEventDrop = (info: EventDropInfo) => {
        syncEventToBackend(info.event)
        .then(syncSucceeded => {
            if (!syncSucceeded) {
                info.revert()
            }
        })
        .catch((reason: any) => {
            console.log(reason)
            info.revert()
        })
    }

    const handleEventResize = (info: EventResizeInfo) => {
        syncEventToBackend(info.event)
        .then(syncSucceeded => {
            if (!syncSucceeded) {
                info.revert()
            }
        })
        .catch((reason: any) => {
            console.log(reason)
            info.revert()
        })
    }

    const handleEventClick = (info: EventClickInfo) => {
        openModal(info.event)
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
                eventSources: [{ events: updateCalendarInterfaceEvents }],
                pointer: true,
                nowIndicator: true,
                selectable: true,
                unselectAuto: false,
                dayHeaderFormat: dayHeaderFormatter,
                firstDay: 1,
                scrollTime: "06:00:00",
                height: "100%",
                select: handleSelect,
                eventDrop: handleEventDrop,
                eventResize: handleEventResize,
                eventClick: handleEventClick
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

    return { calendarRef, selectionInfoRef }
}

export default useCalendar
