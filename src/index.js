import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { createStore } from "redux";
import { combineReducers } from "redux";
import { Provider, ReactReduxContext, connect } from "react-redux";
//----------------------------------------------------Reducers----------------------------------------------------------------
const todo = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case "TOGGLE_TODO":
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, todo(undefined, action)];
    case "TOGGLE_TODO":
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

//-----------------------------------------------combining reducers--------------------------------------------
const todoApp = combineReducers({
  todos,
  visibilityFilter
});

//------------------------------------------------Presentational Components--------------------------------------------------------
const { Component } = React;

const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    ))}
  </ul>
);

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input
        ref={node => {
          input = node;
        }}
      />
      <button
        onClick={() => {
          dispatch({
            type: "ADD_TODO",
            id: nextTodoId++,
            text: input.value
          });
          input.value = "";
        }}
      >
        Add Todo
      </button>
    </div>
  );
};
AddTodo = connect()(AddTodo);

const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

const Footer = () => (
  <p>
    Show: <FilterLinkContainer filter="SHOW_ALL">All</FilterLinkContainer>{" "}
    <FilterLinkContainer filter="SHOW_ACTIVE">Active</FilterLinkContainer>{" "}
    <FilterLinkContainer filter="SHOW_COMPLETED">Completed</FilterLinkContainer>
  </p>
);

//------------------------------------------------------Container components-----------------------------------------------------------
class FilterLink extends Component {
  componentDidMount() {
    const { store } = this.props;
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    //const { store } = this.context;
    //const state = store.getState();

    return (
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Link
            active={props.filter === store.getState().visibilityFilter}
            onClick={() =>
              store.dispatch({
                type: "SET_VISIBILITY_FILTER",
                filter: props.filter
              })
            }
          >
            {props.children}
          </Link>
        )}
      </ReactReduxContext.Consumer>
    );
  }
}
FilterLink.contextTypes = {
  store: PropTypes.object
};

class FilterLinkContainer extends Component {
  render() {
    return (
      <ReactReduxContext.Consumer>
        {({ store }) => <FilterLink store={store} {...this.props} />}
      </ReactReduxContext.Consumer>
    );
  }
}

const mapStateTodoListProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};
const mapDispatchTodoListProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch({ type: "TOGGLE_TODO", id });
    }
  };
};
const VisibleTodoList = connect(
  mapStateTodoListProps,
  mapDispatchTodoListProps
)(TodoList);

//---------------------------------------------------------Helper functions----------------------------------------------------------
const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.completed);
    case "SHOW_COMPLETED":
      return todos.filter(t => t.completed);
    default:
      return todos;
  }
};

//--------------------------------------------------------Parent component and render---------------------------------------------------
let nextTodoId = 0;
const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);
const store = createStore(todoApp);
console.log(store);
window.store = store;
ReactDOM.render(
  <Provider store={store}>
    <TodoApp />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
