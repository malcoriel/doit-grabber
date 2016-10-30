import DoItLib from './lib/lib';
const lib = new DoItLib();
import prompt from 'prompt';
prompt.message = '';
prompt.delimiter = '';
import Q from 'q';
import {argv} from 'yargs';
import GrabberLogic from './logic';
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
			return lib.auth(promptResult)
				.then(() => lib);
		})
		.then((lib) => GrabberLogic.chooseTaskAndGo(lib, argv))
		.then(() => console.log('done'))
		.catch(console.error)
		.done();
}
main();



