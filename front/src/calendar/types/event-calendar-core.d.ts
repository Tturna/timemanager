declare module '@event-calendar/core' {
    export type DisplayMode = "auto" | "background" | "ghost" | "preview" | "pointer"

    export type Content =
        | string
        | { html: string }
        | { domNodes: Node[] }

    export type FetchInfo = {
        start: Date,
        end: Date,
        startStr: string,
        endStr: string
    }

    export type CalendarEventSource =
    | {
        url: string,
        method: string,
        extraParams: any[]
    }
    | {
        events: (
            fetchInfo: FetchInfo,
            successCallback: (events: CalendarEvent[]) => void,
            failureCallback: (failureInfo: any) => void
        ) => void
    }

    export interface CalendarEvent {
        id: string,
        resourceIds: any[],
        allDay: bool,
        start: Date,
        end: Date,
        title: Content,
        editable?: bool,
        startEditable?: bool,
        durationEditable?: bool,
        display: DisplayMode,
        backgroundColor?: string,
        textColor?: string,
        classNames: any[],
        styles: any[],
        extendedProps: {}
    }

    export interface Resource {
        id: string,
        title: Content,
        eventBackgroundColor?: string,
        eventTextColor?: string,
        extendedProps: {}
    }

    export interface View {
        type: any,
        title: any,
        currentStart: Date,
        currentEnd: Date,
        activeStart: Date,
        activeEnd: Date
    }

    export interface SelectionInfo {
        start: Date,
        end: Date,
        startStr: string,
        endStr: string,
        allDay: bool,
        jsEvent: Event,
        view: any,
        resource?: Resource
    }

    export interface EventClickInfo {
        el: HTMLElement,
        event: CalendarEvent,
        jsEvent: Event,
        view: View
    }

    export interface EventDropInfo {
        event: CalendarEvent,
        oldEvent: CalendarEvent,
        oldResource: Resource,
        newResource: Resource,
        delta: any, // duration
        revert: () => void,
        jsEvent: Event,
        view: View
    }

    export interface EventResizeInfo {
        event: CalendarEvent,
        oldEvent: CalendarEvent,
        startDelta: any, // duration
        endDelta: any, // duration
        revert: () => void,
        jsEvent: Event,
        view: View
    }

    export function createCalendar(...args: any[]): CalendarApi;
    export function destroyCalendar(calendar: CalendarApi): void;
    export const TimeGrid: any;
    export const DayGrid: any;
    export const List: any;
    export const Interaction: any;

    export interface CalendarApi {
        addEvent: (event: CalendarEvent) => void,
        unselect: () => void,
        getView: () => View,
        refetchEvents: () => CalendarApi
    }
}
