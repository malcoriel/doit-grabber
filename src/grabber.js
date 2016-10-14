import DoItLib from './lib/lib';
const lib = new DoItLib();
import prompt from 'prompt';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
prompt.message = '';
prompt.delimiter = '';
import Q from 'q';
import {argv} from 'yargs';

function main() {
	const loginSchema = {
		properties: {
			login: {
				message: 'doit.im login:',
				required: true,
			},
			password: {
				message: 'password:',
				hidden: true,
				required: true,
			},
		},
	};
	return Q()
		.then(() => Q.fcall(prompt.start))
		.then(function askForCredentials() {
			return Q.nbind(prompt.get, prompt)(loginSchema);
		})
		.then(function tryAuthenticate(promptResult) {
			return lib.auth(promptResult);
		})
		.then(() => {
			return lib.getAllTasks();
		})
		.tap(console.log)
		.then(() => console.log('done'));
}
main();



