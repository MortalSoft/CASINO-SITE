var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: config.config_site.mailer.service,
	auth: {
		user: config.config_site.mailer.email,
		pass: config.config_site.mailer.password
	}
});

function mailer_send(to, subject, message, callback){
	var options = {
		from: config.config_site.mailer.email,
		to: to,
		subject: subject,
		html: message
	};

	transporter.sendMail(options, function(err1, info){
		if(err1) return callback(err1);
		
		logger.warn('[MAILER] Email sent to ' + to);
		
		callback(null, info);
	});
}


