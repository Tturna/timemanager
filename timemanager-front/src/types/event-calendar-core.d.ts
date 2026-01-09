declare module '@event-calendar/core' {
    export type Content =
        | string
        | { html: string }
        | { domNodes: Node[] }

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
        display: "auto" | "background" | "ghost" | "preview" | "pointer",
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

    export function createCalendar(...args: any[]): any;
    export function destroyCalendar(...args: any[]): void;
    export const TimeGrid: any;
    export const DayGrid: any;
    export const List: any;
    export const Interaction: any;
}
