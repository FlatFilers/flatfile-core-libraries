# Event Topics

Flatfile Listeners can listen to any Flatfile event. Here is a list of all the event topics and their descriptions.

## Agent Events

- `agent:created`: When a new agent is created
- `agent:updated`: When an existing agent is modified
- `agent:deleted`: When an agent is removed from the system

## Space Events

- `space:created`: When a new workspace is created
- `space:updated`: When workspace details are modified
- `space:deleted`: When a workspace is removed
- `space:archived`: When a workspace is archived
- `space:expired`: When a workspace reaches its expiration date
- `space:guestAdded`: When a new guest user is added to a workspace
- `space:guestRemoved`: When a guest user is removed from a workspace

## Document Events

- `document:created`: When a new document is added to a workspace
- `document:updated`: When an existing document is modified
- `document:deleted`: When a document is removed from a workspace

## Workbook Events

- `workbook:created`: When a new workbook is created
- `workbook:updated`: When workbook details are modified
- `workbook:deleted`: When a workbook is removed
- `workbook:expired`: When a workbook reaches its expiration date

## Sheet Events

- `sheet:created`: When a new sheet is added to a workbook
- `sheet:updated`: When sheet details are modified
- `sheet:deleted`: When a sheet is removed from a workbook
- `sheet:counts-updated`: When the record counts in a sheet are updated

## Snapshot Events

- `snapshot:created`: When a new snapshot of data is created

## Record Events

- `records:created`: When new records are added to a sheet
- `records:updated`: When existing records are modified
- `records:deleted`: When records are removed from a sheet

## File Events

- `file:created`: When a new file is uploaded
- `file:updated`: When file details are modified
- `file:deleted`: When a file is removed
- `file:expired`: When a file reaches its expiration date

## Job Events

- `job:created`: When a new job is created
- `job:updated`: When job details are modified
- `job:deleted`: When a job is removed
- `job:completed`: When a job finishes execution
- `job:ready`: When a job is ready to be processed
- `job:scheduled`: When a job is scheduled for future execution
- `job:outcome-acknowledged`: When the outcome of a job is acknowledged
- `job:parts-completed`: When parts of a job are completed
- `job:failed`: When a job fails to execute successfully

## Mapping Events

- `program:created`: When a new mapping program is created
- `program:updated`: When an existing mapping program is modified

## Version Control Events

- `commit:created`: When a new commit is made
- `commit:updated`: When commit details are modified
- `commit:completed`: When a commit operation is finished
- `layer:created`: When a new layer is added in version control

## Secret Management Events

- `secret:created`: When a new secret (e.g., API key) is added
- `secret:updated`: When an existing secret is modified
- `secret:deleted`: When a secret is removed

## Scheduled Events

- `cron:5-minutes`: Triggered every 5 minutes
- `cron:hourly`: Triggered every hour
- `cron:daily`: Triggered once a day
- `cron:weekly`: Triggered once a week

## Environment Events

- `environment:created`: When a new environment is set up
- `environment:updated`: When environment settings are modified
- `environment:deleted`: When an environment is removed

These event topics cover a wide range of actions and states within the Flatfile platform, allowing for detailed tracking and response to various system activities.
