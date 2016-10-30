import Q from 'q';
import _ from 'lodash';
import moment from 'moment';
import naturalSort from 'javascript-natural-sort';

export default class GrabberLogic {
	static doBackup(lib, argv) {
		console.log('Mode is backup, going to grab all your tasks and print them');
		return Q()
			.then(() => {
				return lib.getAllTasks();
			})
			.then((tasks) => {
				if (argv.output) {
					return Q.fcall(fs.writeFile, argv.output, JSON.stringify(tasks, null, 4));
				}
				console.log(tasks);
			});
	}

	static getStats(lib, argv) {
		return Q()
			.then(() => lib.getAllTasks())
			.tap(() => console.log('-----------DONE---------------'))
			.then((tasks) => GrabberLogic.beautifyTasks(lib, argv, tasks))
			.tap((tasks) => GrabberLogic.printCompletedStats(lib, argv, tasks))
			.tap((tasks) => GrabberLogic.printIncompleteStats(lib, argv, tasks))
			.tap(() => console.log('------DONE BY PROJECT---------'))
			.tap((tasks) => GrabberLogic.printCompletedByProjectStats(lib, argv, tasks))
			.tap(() => console.log('-----------PLANNED------------'))
			.tap((tasks) => GrabberLogic.printPlannedStats(lib, argv, tasks))
	}

	static printIncompleteStats(lib, argv, tasks) {
		return Q()
			.then(() => _.reject(tasks, 'completed'))
			.then((tasks) => _.filter(tasks, t => t.myType === 'planned'))
			.tap(incompletePlanned => console.log(incompletePlanned.length));
	}

	static printPlannedStats(lib, argv, tasks) {
		return Q()
			.then(() => _.reject(tasks, 'completed'))
			.then((tasks) => _.filter(tasks, t => t.myType === 'planned'))
			// .tap((tasks) => _.each(tasks, t => console.log(t.title)))
			.tap(planned => console.log(planned.length));
	}

	static printCompletedByProjectStats(lib, argv, tasks) {
		let lastWeekStart = GrabberLogic.getLastWeekStart();

		return Q()
			.then(() => _.filter(tasks, 'completed'))
			.then((tasks) => _.filter(tasks, t => t.completedMoment.isBetween(lastWeekStart, moment.utc())))
			.then((tasks) => _.groupBy(tasks, 'project'))
			.tap((groupedTasks) => {
				let sortedProjects = _(groupedTasks).keys().sort(naturalSort).value();
				_.each(sortedProjects, projectName => {
					console.log(`${projectName ? projectName : 'Unknown'}: ${groupedTasks[projectName].length}`);
				})
			});
	}

	static getLastWeekStart(){
		return moment.utc().startOf('week').subtract(1, 'day').startOf('week').subtract(1, 'day');
	}

	static getLastWeekEnd(){
		return GrabberLogic.getLastWeekStart().add(1, 'week');
	}

	static printCompletedStats(lib, argv, tasks) {
		let lastWeekStart = GrabberLogic.getLastWeekStart();
		let lastWeekEnd = GrabberLogic.getLastWeekEnd();

		function formatTask(t) {
			return {
				title: t.title,
				completedAt: t.completedAt
			}
		}

		let thisWeek = [];
		let lastWeek = [];
		let scheduledDone = [];
		let plannedDone = [];
		let unplannedDone = [];
		let overdoScheduled = [];
		let overdoPlanned = [];
		let overdoUnplanned = [];
		return Q()
			.then(() => _.filter(tasks, 'completed'))
			.then((tasks) => _.filter(tasks, t => t.completedMoment.isAfter(lastWeekStart)))
			.tap((tasks) => thisWeek = _.filter(tasks, t => t.completedMoment.isBetween(lastWeekStart, lastWeekEnd)))
			.tap((tasks) => lastWeek = _.filter(tasks, t => t.completedMoment.isAfter(lastWeekEnd)))
			.tap((tasks) => scheduledDone = _.filter(thisWeek, t => t.myType === 'scheduled'))
			.tap((tasks) => plannedDone = _.filter(thisWeek, t => t.myType === 'planned'))
			.tap((tasks) => unplannedDone = _.filter(thisWeek, t => t.myType === 'unplanned'))
			.tap((tasks) => overdoScheduled = _.filter(lastWeek, t => t.myType === 'scheduled'))
			.tap((tasks) => overdoPlanned = _.filter(lastWeek, t => t.myType === 'planned'))
			.tap((tasks) => overdoUnplanned = _.filter(lastWeek, t => t.myType === 'unplanned'))
			// for debug only
			.then((tasks) => _.map(tasks, formatTask))
			.tap(argv.debugPrint ? console.log : () => {
			})
			// then result is ignored, uses side-effected vars above
			.then(() => {
				console.log(`Scheduled done: ${scheduledDone.length}`);
				console.log(`Planned done ${plannedDone.length}`);
				console.log(`Unplanned done ${unplannedDone.length}`);
				console.log(`Overdo scheduled ${overdoScheduled.length}`);
				console.log(`Overdo planned ${overdoPlanned.length}`);
				console.log(`Overdo unplanned ${overdoUnplanned.length}`);
				console.log('Incomplete - see next');
				console.log('For copying:');
				console.log(scheduledDone.length);
				console.log(plannedDone.length);
				console.log(unplannedDone.length);
				console.log(overdoScheduled.length);
				console.log(overdoPlanned.length);
				console.log(overdoUnplanned.length);

			});
	}

	static beautifyTasks(lib, argv, tasks) {
		/*
		 {
		 "repeat_no": "20161015",
		 "attribute": "plan",
		 "all_day": true,
		 "start_at": 1476640800000,
		 "end_at": 0,
		 "project": "6780af3d-ddb2-47f0-b8cc-282da2901cb4",
		 "priority": 2,
		 "sent_at": 0,
		 "now": false,
		 "pos": 47755005,
		 "estimated_time": 0,
		 "spent_time": 0,
		 "uuid": "6d9b8ba2-fd8b-48c2-bf6e-286bff3c9702",
		 "title": "Пропылесосил",
		 "usn": 9251,
		 "created": 1476381741880,
		 "updated": 1476552136356,
		 "deleted": 0,
		 "trashed": 0,
		 "completed": 1476381741880,
		 "archived": 0,
		 "hidden": 0,
		 "id": "57ffcc2ded7850c026028352",
		 "type": "task"
		 }
		 * */
		/// MAPS TO
		/*
		 * {
		 * title: 'Пропылесосил',
		 * project: 'chores'
		 * completed: true,
		 * completedAt: '2016-10-23T16:54:00Z',
		 * priority: 'low',
		 * }
		 *
		 * */

		return Q()
			.then(() => lib.getProjects())
			.then((projects) => {
				return _.map(tasks, task => {

					const isCompleted = !!task.completed;
					const completedMoment = moment.utc(task.completed);
					return ({
						title: task.title,
						completed: isCompleted,
						completedAt: isCompleted ? completedMoment.format() : null,
						completedMoment: isCompleted ? completedMoment : null,
						priority: ['none', 'low', 'medium', 'high'][task.priority],
						myType: ['unplanned', 'planned', 'scheduled', 'unused'][task.priority],
						project: projects[task.project]
					});
				});
			})
	}

	static chooseTaskAndGo(doItLib, argv) {
		const mode = argv.mode;
		switch (mode) {
			case 'stats':
				return GrabberLogic.getStats(doItLib, argv);
			case 'backup': // intentinally pass through
			default:
				return GrabberLogic.doBackup(doItLib, argv);
		}
	}
}
