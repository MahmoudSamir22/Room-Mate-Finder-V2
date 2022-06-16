const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        secure: true,
        port: 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const emailOptions = {
        from: 'Room Mate Finder',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(emailOptions)

}


module.exports = sendEmail