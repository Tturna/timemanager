import type { Calendar, CalendarEvent, SelectionInfo } from "@event-calendar/core"
import { useRef, useEffect, useMemo, type RefObject } from "react"
import type { JSX } from "react/jsx-runtime"
import useCalendarEvents from "./useCalendarEvents"

function AddEventModal({ closeModal, calendarRef, selectionInfo, eventToEdit }:
{
    closeModal: () => void,
    calendarRef: RefObject<Calendar | null>,
    selectionInfo: SelectionInfo | null,
    eventToEdit: CalendarEvent | null
})
{
    if (!calendarRef.current) return;

    const modalRef = useRef<HTMLDivElement | null>(null)
    const { addEvent, syncEventToBackend, deleteEvent } = useCalendarEvents()

    let title: string

    if (eventToEdit) {
        title = (eventToEdit.title as string).toLowerCase()
    }
    else {
        // Default title option
        title = "lecture"
    }

    let startDateTime: Date
    let endDateTime: Date

    if (eventToEdit) {
        startDateTime = eventToEdit.start
        endDateTime = eventToEdit.end
    }
    else if (selectionInfo) {
        startDateTime = selectionInfo.start
        endDateTime = selectionInfo.end

        startDateTime.setMinutes(Math.floor(startDateTime.getMinutes() / 15) * 15)
    }
    else {
        const calendarView = calendarRef.current.getView()
        startDateTime = calendarView.currentStart
        startDateTime.setHours(8)

        endDateTime = new Date(startDateTime)
        endDateTime.setHours(endDateTime.getHours() + 1)
    }

    const timeOptionElements = useMemo(() => {
        let hours = 0
        let minutes = 0
        let options: JSX.Element[] = []

        while (hours < 24) {
            const timeOptionValue = new Date(startDateTime)
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
    }, [selectionInfo])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const eventType = data.get("eventType") as string
        const startDateString = data.get("startDate") as string
        const endDateString = data.get("startDate") as string
        const startDateTimeString = data.get("startTime") as string
        const endDateTimeString = data.get("endTime") as string

        const startDate = new Date(startDateString)
        const endDate = new Date(endDateString)
        const startDateTime = new Date(startDateTimeString)
        const endDateTime = new Date(endDateTimeString)
        startDateTime.setMonth(startDate.getMonth())
        startDateTime.setDate(startDate.getDate())
        endDateTime.setMonth(endDate.getMonth())
        endDateTime.setDate(endDate.getDate())

        if (eventToEdit) {
            eventToEdit.title = eventType
            eventToEdit.start = startDateTime
            eventToEdit.end = endDateTime

            syncEventToBackend(eventToEdit)
            .then(syncSucceeded => {
                if (syncSucceeded) {
                    calendarRef.current?.refetchEvents()
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
            addEvent(calendarRef, eventType, startDateTime, endDateTime)
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
                calendarRef.current?.refetchEvents()
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

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (!modalRef.current) {
                return
            }

            // Check if mouse is over event creation modal
            if (modalRef.current.contains(event.target as Node)) {
                return
            }

            closeModal()
        }

        // capture = true
        document.addEventListener("mousedown", handler, true)

        return () => {
            // capture = true
            document.removeEventListener("mousedown", handler, true)
        }
    }, [closeModal])

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
                        <select name="eventType" defaultValue={title}>
                            <option value="lecture">Lecture</option>
                            <option value="meeting">Meeting</option>
                            <option value="whatever">Whatever</option>
                        </select>
                    </label>

                    <label className="form-group">
                        <span>Start Time</span>
                        <div>
                            <input type="date" name="startDate" defaultValue={startDateTime.toISOString().slice(0, 10)} />
                            <select name="startTime" defaultValue={startDateTime.toISOString()}>
                            { timeOptionElements }
                            </select>
                        </div>
                    </label>

                    <label className="form-group">
                        <span>End Time</span>
                        <div>
                            <input type="date" name="endDate" defaultValue={endDateTime.toISOString().slice(0, 10)} />
                            <select name="endTime" defaultValue={endDateTime.toISOString()}>
                            { timeOptionElements }
                            </select>
                        </div>
                    </label>

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
