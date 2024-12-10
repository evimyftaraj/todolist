import { ToDoForm } from './to-do-form.js';
import { createToDo } from './create-to-do.js';
import './styles.css';

// Initialize the form content
const todoForm = new ToDoForm('#form');

// Pass the form instance to createToDo
createToDo(todoForm);
