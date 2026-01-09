declare module '@event-calendar/core' {
    export type Content =
        | string
        | { html: string }
        | { domNodes: Node[] }

    export interface Event {
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

    export function createCalendar(...args: any[]): any;
    export function destroyCalendar(...args: any[]): void;
    export const TimeGrid: any;
    export const DayGrid: any;
    export const List: any;
}
