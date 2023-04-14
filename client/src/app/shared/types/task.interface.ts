export interface Task {
    id: string;
    title: string;
    description?: string;
    columnId: string;
    boardId: string;
    userId: string;
}