import type { SelectionInfo } from "@event-calendar/core"
import { useRef, useEffect, useMemo } from "react"
import type { JSX } from "react/jsx-runtime"

function AddEventModal({ closeModal, selectionInfo }:
                       { closeModal: () => void, selectionInfo: SelectionInfo }) {
    const modalRef = useRef<HTMLDivElement | null>(null)

    const timeOptionElements = useMemo(() => {
        let hours = 0
        let minutes = 0
        let options: JSX.Element[] = []

        while (hours < 24) {
            const timeOptionString = (hours <= 9 ? "0" + hours : hours).toString() + ":"
            + (minutes <= 9 ? "0" + minutes : minutes).toString()

            options.push(<option value={timeOptionString} key={timeOptionString}>{timeOptionString}</option>)

            minutes += 15

            if (minutes >= 60) {
                minutes = 0
                hours += 1
            }
        }

        return options
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const data = new FormData(event.currentTarget)
        console.log("submitting:")
        console.log(data)
        console.log(data.get("eventType"))
        console.log(data.get("startDate"))
        console.log(data.get("startTime"))
        console.log(data.get("endDate"))
        console.log(data.get("endTime"))
        closeModal()
    }

    const getDefaultTimeValue = (date: Date) => {
        const hour = date.getHours()
        const minute = Math.floor(date.getMinutes() / 15) * 15
        return (hour <= 9 ? "0" + hour : hour).toString() + ":"
            + (minute <= 9 ? "0" + minute : minute).toString()
    }

    const getDefaultDateValue = (date: Date) => {
        return date.toISOString().slice(0, 10)
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
                <h2 className="modal-title">Create Event</h2>

                <form className="event-form" onSubmit={handleSubmit}>
                    <label className="form-group">
                        <span>Event Type</span>
                        <select name="eventType">
                            <option value="meeting">Meeting</option>
                            <option value="appointment">Appointment</option>
                            <option value="call">Call</option>
                        </select>
                    </label>

                    <label className="form-group">
                        <span>Start Time</span>
                        <div>
                            <input type="date" name="startDate" defaultValue={getDefaultDateValue(selectionInfo.start)} />
                            <select name="startTime" defaultValue={getDefaultTimeValue(selectionInfo.start)}>
                            { timeOptionElements }
                            </select>
                        </div>
                    </label>

                    <label className="form-group">
                        <span>End Time</span>
                        <div>
                            <input type="date" name="endDate" defaultValue={getDefaultDateValue(selectionInfo.end)} />
                            <select name="endTime" defaultValue={getDefaultTimeValue(selectionInfo.end)}>
                            { timeOptionElements }
                            </select>
                        </div>
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="create-btn">Create</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddEventModal
