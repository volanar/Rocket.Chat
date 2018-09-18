import * as Mailer from 'meteor/rocketchat:mailer';

let subject = '';
let html = '';

Meteor.startup(() => {
	RocketChat.settings.get('Verification_Email_Subject', function(key, value) {
		subject = Mailer.replace(value || '');
	});
	RocketChat.settings.get('Verification_Email', function(key, value) {
		html = Mailer.inlinecss(Mailer.wrap(Mailer.replace(value || '')));
	});
});

Meteor.methods({
	sendConfirmationEmail(to) {
		check(to, String);
		const email = to.trim();

		const user = RocketChat.models.Users.findOneByEmailAddress(email);

		if (!user) {
			return false;
		}

		Accounts.emailTemplates.verifyEmail.subject = function(/* userModel*/) {
			return subject;
		};

		Accounts.emailTemplates.verifyEmail.html = function(userModel, url) {
			return Mailer.replacekey(html, 'Verification_Url', url);
		};

		try {
			return Accounts.sendVerificationEmail(user._id, email);
		} catch (error) {
			throw new Meteor.Error('error-email-send-failed', `Error trying to send email: ${ error.message }`, {
				method: 'registerUser',
				message: error.message,
			});
		}

	},
});
