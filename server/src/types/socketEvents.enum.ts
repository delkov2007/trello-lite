export enum SocketEvents {
    boardsJoin = 'boards:join',
    boardsLeave = 'boards:leave',

    boardsUpdate = 'boards:update',
    boardsUpdateFailure = 'boards:updateFailure',
    boardsUpdateSuccess = 'boards:updateSuccess',

    boardsDelete = 'boards:delete',
    boardsDeleteFailure = 'boards:deleteFailure',
    boardsDeleteSuccess = 'boards:deleteSuccess',

    columnsCreate = 'columns:create',
    columnsCreateFailure = 'columns:createFailure',
    columnsCreateSuccess = 'columns:createSuccess',

    columnsDelete = 'columns:delete',
    columnsDeleteFailure = 'columns:deleteFailure',
    columnsDeleteSuccess = 'columns:deleteSuccess',

    columnsUpdate = 'columns:update',
    columnsUpdateFailure = 'columns:updateFailure',
    columnsUpdateSuccess = 'columns:updateSuccess',

    tasksCreate = 'tasks:create',
    tasksCreateFailure = 'tasks:createFailure',
    tasksCreateSuccess = 'tasks:createSuccess',

    tasksUpdate = 'tasks:update',
    tasksUpdateFailure = 'tasks:updateFailure',
    tasksUpdateSuccess = 'tasks:updateSuccess',

    tasksDelete = 'tasks:delete',
    tasksDeleteFailure = 'tasks:deleteFailure',
    tasksDeleteSuccess = 'tasks:deleteSuccess',
}