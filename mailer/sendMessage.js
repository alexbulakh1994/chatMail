var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",  // sets automatically host, port and connection security settings
   auth: {
       user: "alexbulakh707@gmail.com",
       pass: "34212328031994"
   }
});

module.exports = function sendEmail(options, callback) {
  smtpTransport.sendMail(options, function(error, response){  //callback
     if(error){
         console.log(error);
     }else{
        console.log("Message sent: " + response.message);
        callback(); 
     }
     
     smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
  });
}

