import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { moveTask } from '../store/slices/taskSlice';

export const useDragDrop = () => {
  const dispatch = useDispatch();
  const lists = useSelector(state => state.boards.lists);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = lists.find(l => l._id === source.droppableId);
    const destList = lists.find(l => l._id === destination.droppableId);

    if (!sourceList || !destList) return;

    // Build task order
    const sourceTasks = Array.from(sourceList.tasks || []);
    const destTasks = source.droppableId === destination.droppableId
      ? sourceTasks
      : Array.from(destList.tasks || []);

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
    } else {
      destTasks.splice(destination.index, 0, movedTask);
    }

    // Build task order for API
    const taskOrder = [];

    if (source.droppableId === destination.droppableId) {
      sourceTasks.forEach((task, index) => {
        taskOrder.push({
          taskId: task._id,
          listId: source.droppableId,
          position: index
        });
      });
    } else {
      sourceTasks.forEach((task, index) => {
        taskOrder.push({
          taskId: task._id,
          listId: source.droppableId,
          position: index
        });
      });
      destTasks.forEach((task, index) => {
        taskOrder.push({
          taskId: task._id,
          listId: destination.droppableId,
          position: index
        });
      });
    }

    dispatch(moveTask({
      id: draggableId,
      data: {
        sourceListId: source.droppableId,
        destinationListId: destination.droppableId,
        newPosition: destination.index,
        taskOrder
      }
    }));
  }, [lists, dispatch]);

  return { handleDragEnd };
};