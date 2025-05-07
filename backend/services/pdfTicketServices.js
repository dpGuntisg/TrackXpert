import User from "../models/User.js";
import Event from "../models/Event.js";
import PDFkit from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sanitizeName } from "./helpers/sanitizeHelper.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PdfTicketService {
    static async generateEventPdfTicket(userId, eventId, res) {
        const user = await User.findById(userId);
        const event = await Event.findById(eventId);
        if (!user || !event) {
            throw new Error("User or event not found");
        }

        const doc = new PDFkit({ size: "A4", margin: 50 });

        const eventName = sanitizeName(event.name);
        const userName = sanitizeName(user.name);
        const userSurname = sanitizeName(user.surname);
        const userFullName = `${userName} ${userSurname}`;
        const eventLocation = event.location || "-";
        const startDate = event.date?.startDate ? new Date(event.date.startDate) : null;
        const endDate = event.date?.endDate ? new Date(event.date.endDate) : null;

        const fontPath = path.resolve(__dirname, "../utils/NewsCycle-Regular.ttf");

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition",`attachment; filename=\"event-ticket-${user._id}-${event._id}.pdf\"`);

        doc.font(fontPath);

        // Draw ticket border/box
        const boxX = 40;
        const boxY = 60;
        const boxWidth = 480;
        const boxHeight = 260;
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 12).stroke();

        let y = boxY + 24;
        const leftPad = boxX + 24;
        const sectionGap = 28;
        const labelColor = "#888";
        const valueColor = "#111";

        // Event Name
        doc.fontSize(10).fillColor(labelColor).text("EVENT", leftPad, y, { align: "left" });
        y += 14;
        doc.fontSize(20).fillColor(valueColor).text(eventName, leftPad, y, { align: "left" });
        y += sectionGap;

        // Participant Name
        doc.fontSize(10).fillColor(labelColor).text("PARTICIPANT", leftPad, y, { align: "left" });
        y += 14;
        doc.fontSize(16).fillColor(valueColor).text(userFullName, leftPad, y, { align: "left" });
        y += sectionGap;

        // Location
        doc.fontSize(10).fillColor(labelColor).text("LOCATION", leftPad, y, { align: "left" });
        y += 14;
        doc.fontSize(14).fillColor(valueColor).text(eventLocation, leftPad, y, { align: "left" });
        y += sectionGap;

        // Date and Time
        doc.fontSize(10).fillColor(labelColor).text("DATE AND TIME", leftPad, y, { align: "left" });
        y += 14;
        let dateText = "-";
        if (startDate && endDate) {
            const opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            dateText = `${startDate.toLocaleString('en-US', opts)} to\n${endDate.toLocaleString('en-US', opts)}`;
        }
        doc.fontSize(12).fillColor(valueColor).text(dateText, leftPad, y, { align: "left" });

        doc.pipe(res);
        doc.end();
    }
}

export default PdfTicketService;
