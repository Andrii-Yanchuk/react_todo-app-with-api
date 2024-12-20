import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import cn from 'classnames';

type Props = {
  todo: Todo;
  isLoading?: boolean;
  isInEditMode?: boolean;
  onUpdateTodo: (todo: Todo) => Promise<void>;
  onRemoveTodo: (todoId: number) => Promise<void>;
  setEditTodo: Dispatch<SetStateAction<null | number>>;
};

export const TodoItem: React.FC<Props> = props => {
  const {
    todo,
    isLoading,
    onRemoveTodo,
    onUpdateTodo,
    isInEditMode,
    setEditTodo,
  } = props;

  const [newTitle, setNewTitle] = useState(todo.title);

  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectTodo = () => {
    const todoToUpdate = { ...todo, completed: !todo.completed };
    onUpdateTodo(todoToUpdate);
  };

  const onEditDoubleClick = () => {
    setEditTodo(todo.id);
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedTitle = newTitle.trim();

    if (todo.title === normalizedTitle) {
      setEditTodo(null);
      return;
    }

    if (isLoading) return;

    try {
      if (normalizedTitle === '') {
        await onRemoveTodo(todo.id);
      } else {
        setNewTitle(normalizedTitle);
        await onUpdateTodo({ ...todo, title: normalizedTitle });
      }

      setEditTodo(null);
    } catch (err) {
      inputRef?.current?.focus();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setEditTodo(null);
      setNewTitle(todo.title);
    }
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={onSelectTodo}
        />
      </label>

      {isInEditMode ? (
        <form onSubmit={onSubmit} onBlur={onSubmit}>
          <input
            autoFocus
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)}
            onKeyUp={handleKeyUp}
            ref={inputRef}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={onEditDoubleClick}
          >
            {isLoading ? newTitle : todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onRemoveTodo(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', { 'is-active': isLoading })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
