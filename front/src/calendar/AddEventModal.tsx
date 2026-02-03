import type { CalendarApi, CalendarEvent, SelectionInfo } from "@event-calendar/core"
import { useRef, useEffect, useMemo, type RefObject, type ChangeEvent, useState } from "react"
import type { JSX } from "react/jsx-runtime"
import useCalendarEvents from "./useCalendarEvents"
import type { EventTypeModel } from "../types/api_schema"

function getInitialEventData(calendar: CalendarApi, eventToEdit: CalendarEvent | null, selectionInfo: SelectionInfo | null) {
    let initialTitle: string

    if (eventToEdit) {
        initialTitle = (eventToEdit.title as string).toLowerCase()
    }
    else {
        // Default title option
        // initialTitle = "lecture"
        initialTitle = ""
    }

    let initialStartDateTime: Date
    let initialEndDateTime: Date
    let initialCssColor = "#0099db"

    if (eventToEdit) {
        initialStartDateTime = new Date(eventToEdit.start)
        initialEndDateTime = new Date(eventToEdit.end)

        if (eventToEdit.backgroundColor) {
            initialCssColor = eventToEdit.backgroundColor
        }
    }
    else if (selectionInfo) {
        initialStartDateTime = new Date(selectionInfo.start)
        initialEndDateTime = new Date(selectionInfo.end)

        initialStartDateTime.setMinutes(Math.floor(initialStartDateTime.getMinutes() / 15) * 15)
    }
    else {
        const calendarView = calendar.getView()
        initialStartDateTime = new Date(calendarView.currentStart)
        initialStartDateTime.setHours(8)

        initialEndDateTime = new Date(initialStartDateTime)
        initialEndDateTime.setHours(initialEndDateTime.getHours() + 1)
    }

    return { initialTitle, initialStartDateTime, initialEndDateTime, initialCssColor }
}

function getEventDataFromFormData(data: FormData) {
    const title = data.get("eventType") as string
    const startDateString = data.get("startDate") as string
    const endDateString = data.get("endDate") as string
    const startDateTimeString = data.get("startTime") as string
    const endDateTimeString = data.get("endTime") as string
    const eventColor = data.get("eventColor") as string | undefined

    if (typeof(title) !== "string" ||
        typeof(startDateString) !== "string" ||
        typeof(endDateString) !== "string" ||
        typeof(startDateTimeString) !== "string" ||
        typeof(endDateTimeString) !== "string"
    ) {
        throw new Error("Invalid form data!")
    }

    const startDate = new Date(startDateString)
    const endDate = new Date(endDateString)
    const startDateTime = new Date(startDateTimeString)
    const endDateTime = new Date(endDateTimeString)
    startDateTime.setMonth(startDate.getMonth())
    startDateTime.setDate(startDate.getDate())
    endDateTime.setMonth(endDate.getMonth())
    endDateTime.setDate(endDate.getDate())

    return { title, startDateTime, endDateTime, eventColor }
}

function AddEventModal({ closeModal, calendarRef, selectionInfo, eventToEdit, updateStatusMessage }:
{
    closeModal: () => void,
    calendarRef: RefObject<CalendarApi>,
    selectionInfo: SelectionInfo | null,
    eventToEdit: CalendarEvent | null,
    updateStatusMessage: (message: string) => void
})
{
    const calendar = calendarRef?.current
    const endDateInputRef = useRef<HTMLInputElement | null>(null)
    const [dateInputsLinked, setDateInputsLinked] = useState(true)

    if (!calendar) {
        throw new Error("AddEventModal rendered without valid calendar reference!")
    }

    const modalRef = useRef<HTMLDivElement | null>(null)
    const [existingEventTypes, setExistingEventTypes] = useState<EventTypeModel[] | null>(null)
    const { fetchEventTypes, addEvent, syncEventToBackend, deleteEvent } = useCalendarEvents(updateStatusMessage)
    const { initialTitle, initialStartDateTime, initialEndDateTime, initialCssColor } = getInitialEventData(calendar, eventToEdit, selectionInfo)

    const timeOptionElements = useMemo(() => {
        let hours = 0
        let minutes = 0
        let options: JSX.Element[] = []

        while (hours < 24) {
            const timeOptionValue = new Date(initialStartDateTime)
            timeOptionValue.setHours(hours)
            timeOptionValue.setMinutes(minutes)

            const timeOptionString = (hours <= 9 ? "0" + hours : hours).toString() + ":"
            + (minutes <= 9 ? "0" + minutes : minutes).toString()

            options.push(<option value={timeOptionValue.toISOString()} key={timeOptionString}>{timeOptionString}</option>)

            minutes += 15

            if (minutes >= 60) {
                minutes = 0
                hours += 1
            }
        }

        return options
    }, [initialStartDateTime])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const { title, startDateTime, endDateTime, eventColor } = getEventDataFromFormData(data)

        if (eventToEdit) {
            const editedEvent = {
                ...eventToEdit,
                title,
                start: startDateTime,
                end: endDateTime,
                backgroundColor: eventColor
            }

            syncEventToBackend(editedEvent)
            .then(syncSucceeded => {
                if (syncSucceeded) {
                    calendar.refetchEvents()
                }
                else {
                    console.log("Failed to edit event")
                }
            })
            .catch((reason: any) => {
                console.log(reason)
            })
        }
        else {
            addEvent(calendarRef, title, startDateTime, endDateTime, eventColor)

            if (existingEventTypes) {
                // use the length of the array as a temp ID
                existingEventTypes.push({ id: existingEventTypes.length.toString(), name: title })
                setExistingEventTypes(existingEventTypes)
            }
        }

        closeModal()
    }

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!eventToEdit) return

        event.preventDefault()

        if (!window.confirm("Are you sure you want to delete this event?")) return

        deleteEvent(eventToEdit.id)
        .then(deleteSucceeded => {
            if (deleteSucceeded) {
                calendar.refetchEvents()
            }
            else {
                console.log("Failed to delete event")
            }
        })
        .catch(reason => {
            console.log(reason)
        })

        closeModal()
    }

    const handleChangeStartDate = (event: ChangeEvent<HTMLInputElement>) => {
        if (!endDateInputRef.current) return
        if (!dateInputsLinked) return

        endDateInputRef.current.value = event.target.value
    }

    const handleToggleDateLink = () => {
        setDateInputsLinked(!dateInputsLinked)
    }

    useEffect(() => {
        fetchEventTypes()
        .then(eventTypes => {
            setExistingEventTypes(eventTypes)
        })
        .catch(_ => {
        })

        const handler = (event: MouseEvent) => {
            if (!modalRef.current) {
                return
            }

            // Check if mouse is over event creation modal
            if (modalRef.current.contains(event.target as Node)) {
                return
            }

            closeModal()
            calendar.unselect()
        }

        // capture = true
        document.addEventListener("mousedown", handler, true)

        return () => {
            // capture = true
            document.removeEventListener("mousedown", handler, true)
        }
    }, [])

    return (
        <div className="modal-overlay">
            <div className="modal" ref={modalRef}>
            {
                eventToEdit
                ? <h2 className="modal-title">Edit Event</h2>
                : <h2 className="modal-title">Create Event</h2>
            }

                <form className="event-form" onSubmit={handleSubmit}>
                    <label className="form-group">
                        <span>Event Type</span>
                        <input name="eventType" type="text" list="existingTypeOptions" defaultValue={initialTitle} />
                        <datalist id="existingTypeOptions">
                        {
                            existingEventTypes?.map(eventType => {
                                return <option key={eventType.id} value={eventType.name}>{eventType.name}</option>
                            })
                        }
                        </datalist>
                    </label>

                    <div className="modal-form-dateselector-container">
                        <label className="form-group">
                            <span>Start Time</span>
                            <div>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={initialStartDateTime.toISOString().slice(0, 10)}
                                    onChange={handleChangeStartDate}
                                />
                                <select name="startTime" defaultValue={initialStartDateTime.toISOString()}>
                                { timeOptionElements }
                                </select>
                            </div>
                        </label>

                        <div className="modal-link-container">
                        {
                            dateInputsLinked
                            ? <img src="link_icon.svg" className="modal-link-icon" onClick={handleToggleDateLink} />
                            : <img src="link_off_icon.svg" className="modal-link-icon" onClick={handleToggleDateLink} />
                        }
                        </div>

                        <label className="form-group">
                            <span>End Time</span>
                            <div>
                                <input
                                    ref={endDateInputRef}
                                    type="date"
                                    name="endDate"
                                    defaultValue={initialEndDateTime.toISOString().slice(0, 10)}
                                />
                                <select name="endTime" defaultValue={initialEndDateTime.toISOString()}>
                                { timeOptionElements }
                                </select>
                            </div>
                        </label>

                        {
                            eventToEdit &&
                            <label className="form-group">
                                <span>Color</span>
                                <input type="color" name="eventColor" defaultValue={initialCssColor} />
                            </label>
                        }
                    </div>

                    <div className="form-actions">
                    {
                        eventToEdit
                        ? (
                            <div className="flex-row">
                                <button type="submit" className="delete-btn" onClick={handleDelete}>Delete</button>
                                <button type="submit" className="create-btn">Save</button>
                            </div>
                        )
                        : <button type="submit" className="create-btn">Create</button>
                    }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddEventModal
