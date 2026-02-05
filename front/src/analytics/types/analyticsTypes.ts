export type EventTypeHourInfo = Record<string, {
    color: string,
    hours: string
}>

export type EventTypeHoursResult = {
    eventTypeHours: EventTypeHourInfo
    totalHours: number
}
