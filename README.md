# doit-grabber
This is a tool for getting all your tasks from a populard GTD-compliant todo service doit.im. 
It will grab all the tasks from all the boxes, including 'Completed' and 'Trash', and will output it as a JSON.
An option to write it to file is also provided
## Interactive usage:
```
npm start
```
## Non-interactive usage (like for cronjob backup)
```
npm start -- --login=<your login> --password=<your password> --output=<path to output file>
```
## Export tasks as Todoist project
```
npm start -- --login=<your login> --password=<your password> --output=<path to output file> --format=todoist
```
https://todoist.com/help/articles/importing-or-exporting-project-templates