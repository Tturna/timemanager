import { useEffect, useRef, type RefObject } from "react"
import exporter from "./exporter"
import type { CalendarApi } from "@event-calendar/core"

function ExportModal({ closeModal, updateStatusMessage, calendarRef }: {
    closeModal: () => void,
    updateStatusMessage: (message: string) => void,
    calendarRef: RefObject<CalendarApi>
}) {
    const modalRef = useRef<HTMLDivElement | null>(null)
    const startDateInputRef = useRef<HTMLInputElement | null>(null)
    const endDateInputRef = useRef<HTMLInputElement | null>(null)
    const fileNameInputRef = useRef<HTMLInputElement | null>(null)

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
    }, [])

    const handleSubmit = () => {
        if (!startDateInputRef.current || !endDateInputRef.current || !fileNameInputRef.current) return

        const startDate = new Date(startDateInputRef.current.value)
        const endDate = new Date(endDateInputRef.current.value)
        const fileName = fileNameInputRef.current.value

        exporter.exportEventsPdf(updateStatusMessage, startDate, endDate, fileName)
    }

    const initialStartDateTime = calendarRef.current.getView().currentStart
    const initialEndDateTime = calendarRef.current.getView().currentEnd
    const initialStartDateString = initialStartDateTime.toISOString().slice(0, 10)
    const initialEndDateString = initialEndDateTime.toISOString().slice(0, 10)
    const defaultFileName = `tyotunnit_${initialStartDateString}_-_${initialEndDateString}.pdf`

    return (
        <div className="modal-overlay">
            <div className="modal" ref={modalRef}>
                <h2 className="modal-title">Export PDF</h2>
                <div className="modal-form-dateselector-container">
                    <label className="form-group">
                        <span>Start Time</span>
                        <div>
                            <input
                                ref={startDateInputRef}
                                type="date"
                                name="startDate"
                                defaultValue={initialStartDateString}
                            />
                        </div>
                    </label>

                    <label className="form-group">
                        <span>End Time</span>
                        <div>
                            <input
                                ref={endDateInputRef}
                                type="date"
                                name="endDate"
                                defaultValue={initialEndDateString}
                            />
                        </div>
                    </label>

                    <label className="form-group">
                        <span>File name</span>
                        <div>
                            <input
                                ref={fileNameInputRef}
                                type="text"
                                name="fileName"
                                defaultValue={defaultFileName}
                            />
                        </div>
                    </label>
                </div>

                <div className="form-actions">
                    <button onClick={handleSubmit} className="create-btn">Export</button>
                </div>
            </div>
        </div>
    )
}

export default ExportModal
