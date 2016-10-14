const agent = require('superagent-promise')(require('superagent'), Q.Promise);
import Q from 'q';

export default class DoItLib {
	method(){
		console.log('foo');
	}

	auth({login,password}){
		console.log(`mock auth for ${login} success`);
		return Q();
	}

	getTaskList(){
		return Q(['mock-task-1','mock-task-2']);
	}
}
