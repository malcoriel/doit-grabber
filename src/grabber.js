import DoItLib from './lib/lib';
const lib = new DoItLib();
import prompt from 'prompt';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
prompt.message = '';
prompt.delimiter = '';
import Q from 'q';
import {argv} from 'yargs';
import fs from 'fs';
function main() {
	return Q()
		.then(() => {
			if (argv.login && argv.password)
				return { login: argv.login, password: argv.password };
			return Q.fcall(prompt.start)
				.then(function askForCredentials() {
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
					return Q.nbind(prompt.get, prompt)(loginSchema);
				});
		})
		.then(function tryAuthenticate(promptResult) {
			return lib.auth(promptResult);
		})
		.then(() => {
			return lib.getAllTasks();
		})
		.then((tasks) => {
			if(argv.output)
			{
				return Q.fcall(fs.writeFile, argv.output, JSON.stringify(tasks, null, 4));
			}
			console.log(tasks);
		})
		.then(() => console.log('done'));
}
main();



