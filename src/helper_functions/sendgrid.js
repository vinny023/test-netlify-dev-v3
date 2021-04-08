const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey('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')
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
