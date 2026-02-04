import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
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
    const userIdentifierInputRef = useRef<HTMLInputElement | null>(null)
    const fileNameInputRef = useRef<HTMLInputElement | null>(null)
    const [formErrors, setFormErrors] = useState<ReactNode[]>([])

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
        if (!startDateInputRef.current ||
            !endDateInputRef.current ||
            !fileNameInputRef.current ||
            !userIdentifierInputRef.current) return

        const startDate = new Date(startDateInputRef.current.value)
        const endDate = new Date(endDateInputRef.current.value)
        const userIdentifier = userIdentifierInputRef.current.value
        const fileName = fileNameInputRef.current.value
        let failed = false
        setFormErrors([])

        if (userIdentifier.length <= 0) {
            setFormErrors(currentErrors => {
                let newErrors = [ ...currentErrors, <p key="employeeNameError">Employee name missing</p> ]
                return newErrors
            })

            failed = true
        }

        if (fileName.length <= 0) {
            setFormErrors(currentErrors => {
                let newErrors = [ ...currentErrors, <p key="filenameError">File name missing</p> ]
                return newErrors
            })

            failed = true
        }

        if (failed) {
            return
        }

        exporter.exportEventsPdf(updateStatusMessage, startDate, endDate, fileName, userIdentifier)
    }

    const handleDateChange = () => {
        if (!startDateInputRef.current || !endDateInputRef.current) return

        if (startDateInputRef.current.value > endDateInputRef.current.value) {
            endDateInputRef.current.value = startDateInputRef.current.value
        }
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

                <div className="form-errors">
                { formErrors }
                </div>

                <label className="form-group">
                    <span>Start time</span>
                    <div>
                        <input
                            ref={startDateInputRef}
                            type="date"
                            name="startDate"
                            defaultValue={initialStartDateString}
                            onChange={handleDateChange}
                        />
                    </div>
                </label>

                <label className="form-group">
                    <span>End time</span>
                    <div>
                        <input
                            ref={endDateInputRef}
                            type="date"
                            name="endDate"
                            defaultValue={initialEndDateString}
                            onChange={handleDateChange}
                        />
                    </div>
                </label>

                <label className="form-group">
                    <span>Employee name</span>
                    <div>
                        <input
                            ref={userIdentifierInputRef}
                            type="text"
                            name="userIdentifier"
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

                <div className="form-actions">
                    <button onClick={handleSubmit} className="create-btn">Export</button>
                </div>
            </div>
        </div>
    )
}

export default ExportModal
