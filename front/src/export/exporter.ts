import { jsPDF } from 'jspdf'
import type { CalendarEventModel } from '../types/api_schema'

function exportEventsPdf() {

    const doc = new jsPDF()

    doc.text("Testing", 10, 10)
    doc.text("abcABC åöä ÅÖÄ ???", 10, 30)
    doc.save("test.pdf")
}

export default { exportPdf: exportEventsPdf }
