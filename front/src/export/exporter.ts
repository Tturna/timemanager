import { jsPDF } from 'jspdf'
import useCalendarEvents from '../calendar/useCalendarEvents'
import type { CalendarEventModel } from '../types/api_schema'

function exportEventsPdf(updateStatusMessage: (message: string) => void) {
    const { fetchEvents } = useCalendarEvents(updateStatusMessage)

    fetchEvents()
    .then(events => {
        // Pick events from between given start and end times.
        // Group events by type/title.
        // Calculate total hours per group -> add to PDF.
        // Calculate total hours -> add to PDF.

        let eventTypeHours = {}

        for (let i = 0; i < events.length; i++) {
            const event = events[i] as CalendarEventModel
            const startDate = new Date(event.startDateTime)
            const endDate = new Date(event.endDateTime)
            // @ts-expect-error
            const diffMs = endDate - startDate
            const diffHours = Math.ceil(diffMs) / 1000 / 60 / 60

            if (Object.hasOwn(eventTypeHours, event.title)) {
                // @ts-expect-error
                eventTypeHours[event.title] += diffHours
            }
            else {
                Object.defineProperty(eventTypeHours, event.title, {
                    value: diffHours,
                    writable: true
                })
            }
        }

        var keys = Object.getOwnPropertyNames(eventTypeHours)

        for (let i = 0; i < keys.length; i++) {
            // @ts-expect-error
            const hours = eventTypeHours[keys[i]]
            // @ts-expect-error
            eventTypeHours[keys[i]] = hours.toString()
        }

        function createHeaders(keys: string[]) {
            var result = [];

            for (var i = 0; i < keys.length; i += 1) {
                result.push({
                    id: keys[i],
                    name: keys[i],
                    prompt: keys[i],
                    width: 65,
                    align: "center",
                    padding: 0
                });
            }

            return result;
        }

        var headers = createHeaders(keys);
        var data = [eventTypeHours]

        var doc = new jsPDF();
        // @ts-expect-error
        doc.table(5, 5, data, headers);
        doc.save("test.pdf")
    })
    .catch(reason => {
        updateStatusMessage("Failed to export PDF. Try again later or contact the administrator.")
        throw reason
    })
}

export default { exportEventsPdf }
