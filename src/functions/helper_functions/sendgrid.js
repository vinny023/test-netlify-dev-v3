const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = async(sgMsg, ) => {

    try {
        return await sgMail.send({...sgMsg, tracking_settings: {open_tracking: {enable:true}}})
    } catch(error) {     
        return {
            error: error
        }
    } 
 
}
