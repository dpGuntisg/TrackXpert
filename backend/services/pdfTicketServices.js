import mongoose from "mongoose";
import User from "../models/User";
import Event from "../models/Event";
import PDFkit from "pdfkit";
import fs from "fs";
import { sanitizeName } from "./helpers/sanitizeHelper";

class PdfTicketService{
    static async generateEventPdfTicket(userId, eventId, res){
        const user = await User.findById(userId);
        const event = await Event.findById(eventId);
        const doc = new PDFkit({size: "A4", margin: 50});
        let eventName = sanitizeName(event.name);
        let userName = sanitizeName(user.name);
        let userSurname = sanitizeName(user.surname);
        let userFullName = `${userName} ${userSurname}`;

        if(!user || !event){throw new Error("User or event not found");};

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="event-ticket-${user._id}-${event._id}.pdf"`);

        doc.font("../utils/NewsCycle-Regular.ttf");
        doc.fontSize(12);

        doc.fillColor("gray") 
        .text("Event", { align: "left" });

        doc.fontSize(18)
            .text(eventName,{
                align:"left",
                continued:"true"
        });

        doc.fillColor("gray") 
        .text("Participant", { align: "left" });

        doc.fontSize(18)
            .text(userFullName, {align:"left"});

        
         // Pipe the PDF to the response stream
        doc.pipe(res); // This will send the PDF directly to the client
        // Finalize the PDF document
        doc.end();


    };
}

export default PdfTicketService;


