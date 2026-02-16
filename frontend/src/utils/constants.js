export const BOARD_COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632',
  '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
  '#838c91'
];

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#61bd4f', bg: '#eef6ee' },
  medium: { label: 'Medium', color: '#f2d600', bg: '#fdf8e1' },
  high: { label: 'High', color: '#ff9f1a', bg: '#fef3e2' },
  urgent: { label: 'Urgent', color: '#eb5a46', bg: '#fce8e6' },
};

export const ACTION_LABELS = {
  board_created: 'created this board',
  board_updated: 'updated this board',
  list_created: 'created list',
  list_updated: 'updated list',
  list_deleted: 'deleted list',
  task_created: 'created task',
  task_updated: 'updated task',
  task_deleted: 'deleted task',
  task_moved: 'moved task',
  task_assigned: 'assigned',
  task_unassigned: 'unassigned',
  task_completed: 'completed task',
  member_added: 'added member',
  member_removed: 'removed member',
};