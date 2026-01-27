import { jsPDF } from 'jspdf'
import useCalendarEvents from '../calendar/useCalendarEvents'
import type { CalendarEventModel } from '../types/api_schema'
import auth from '../auth/auth'

function exportEventsPdf(
    updateStatusMessage: (message: string) => void,
    startDate: Date,
    endDate: Date,
    fileName: string,
    userIdentifier: string
) {
    const { fetchEventsWithUser } = useCalendarEvents(updateStatusMessage)

    auth.userManager.getUser()
    .then(user => {
        if (user == null) {
            updateStatusMessage("Couldn't load logged in user data. Try again later or contact the administrator.")
            return
        }

        fetchEventsWithUser(user, undefined, startDate, endDate)
        .then(events => {
            let eventTypeHours = {}
            let totalHours = 0
            const headers = [ "Tapahtuma", "Tunnit" ]

            for (let i = 0; i < events.length; i++) {
                const event = events[i] as CalendarEventModel
                const startDate = new Date(event.startDateTime)
                const endDate = new Date(event.endDateTime)
                // @ts-expect-error
                const diffMs = endDate - startDate
                const diffHours = diffMs / 1000 / 60 / 60

                totalHours += diffHours

                if (Object.hasOwn(eventTypeHours, event.eventType.name)) {
                    // @ts-expect-error
                    eventTypeHours[event.title] += diffHours
                }
                else {
                    Object.defineProperty(eventTypeHours, event.eventType.name, {
                        value: diffHours,
                        writable: true
                    })
                }
            }

            Object.defineProperty(eventTypeHours, "Tunnit yhteensä", {
                value: totalHours,
                writable: true
            })

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

            var headerObjects = createHeaders(headers);
            const data = Object.getOwnPropertyNames(eventTypeHours).map(prop => {
                return {
                    Tapahtuma: prop,
                    // @ts-expect-error
                    Tunnit: eventTypeHours[prop]
                };
            })

            var doc = new jsPDF();

            const startDateString = startDate.toLocaleString("fi-FI").split(" ")[0]
            const endDateString = endDate.toLocaleString("fi-FI").split(" ")[0]
            doc.text(`Toteutuneet työtunnit ajalta ${startDateString} - ${endDateString}`, 5, 10)

            doc.text(userIdentifier, 5, 20)

            // @ts-expect-error
            doc.table(5, 30, data, headerObjects);
            doc.save(fileName)
        })
        .catch(_ => {
            updateStatusMessage("Failed to export PDF. Try again later or contact the administrator.")
        })
    })
    .catch(_ => {
        updateStatusMessage("Couldn't load logged in user data. Try again later or contact the administrator.")
    })
}

export default { exportEventsPdf }
