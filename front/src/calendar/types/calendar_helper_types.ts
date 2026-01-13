import type { CalendarApi, CalendarEvent, FetchInfo } from "@event-calendar/core";
import type { RefObject } from "react";

export type FetchEventsFn = (
    fetchInfo: FetchInfo,
    successCallback: (events: CalendarEvent[]) => void,
    failureCallback: (failureInfo?: unknown) => void
) => void

export type AddEventFn = (
    calendarRef: RefObject<CalendarApi | null>,
    title: string,
    start: Date,
    end: Date
) => void
