import { hideForm } from "./create-to-do.js";

export class ToDoForm {
    constructor(formContainerId) {
        this.formContainer = document.querySelector(formContainerId);
        this.taskData = {}; // Stores tasks by category
        this.isEditMode = false;
        this.editingTaskIndex = null;
        this.editingCategory = null;
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.loadTasks();
        this.createForm();
        this.createModal(); // Create the modal for showing task details
    }

    createForm(task = null, category = '') {
        // Ensure the form container exists
        if (!this.formContainer) {
            console.error('Form container not found. Reinitializing form container.');
            this.formContainer = document.createElement('div');
            this.formContainer.id = 'form';
            this.formContainer.classList.add('form-container');
            document.body.appendChild(this.formContainer);
        }
    
        this.formContainer.innerHTML = '';
    
        const title = this.createElement('h2', 'What do you need to do?');
        title.classList.add('form-title');
        
        const titleLabel = this.createElement('label', 'Title');
        titleLabel.classList.add('label');
        const titleInput = this.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Enter the task title';
        titleInput.classList.add('input');
        titleInput.value = task?.title || ''; // Use default value if task is null/undefined

    
        titleInput.addEventListener('input', () => {
            titleInput.classList.remove('input-error');
            titleInput.placeholder = 'Enter the task title...';
        });
    
        const categoryLabel = this.createElement('label', 'Category');
        categoryLabel.classList.add('label');
        const categoryInput = this.createElement('input');
        categoryInput.type = 'text';
        categoryInput.placeholder = 'Projects, Appointments, Homework, etc...';
        categoryInput.classList.add('input');
        categoryInput.value = category || ''; // Use default value

    
        categoryInput.addEventListener('input', () => {
            categoryInput.classList.remove('input-error');
            categoryInput.placeholder = 'Projects, Appointments, Homework, etc...';
        });
    
        const dateLabel = this.createElement('label', 'Due Date');
        dateLabel.classList.add('label');
        const dateInput = this.createElement('input');
        dateInput.type = 'date';
        dateInput.classList.add('input');
        dateInput.value = task?.date || ''; // Use empty value if no date is provided

    
        const detailsLabel = this.createElement('label', 'Details');
        detailsLabel.classList.add('label');
        const detailsTextarea = this.createElement('textarea');
        detailsTextarea.placeholder = 'Enter details (add bullet points, etc.)';
        detailsTextarea.rows = 6;
        detailsTextarea.classList.add('textarea');
        detailsTextarea.value = task?.details || ''; // Use default value

    
        const priorityLabel = this.createElement('label', 'Priority');
        priorityLabel.classList.add('label');
        const prioritySelect = this.createPrioritySelect();
        prioritySelect.classList.add('select');
        prioritySelect.value = task?.priority || 'low'; // Default to 'low' priority

    
        const submitBtn = this.createElement('button', this.isEditMode ? 'Update' : 'Submit');
        submitBtn.classList.add('submit');
    
        this.formContainer.append(
            title,
            titleLabel,
            titleInput,
            categoryLabel,
            categoryInput,
            dateLabel,
            dateInput,
            detailsLabel,
            detailsTextarea,
            priorityLabel,
            prioritySelect,
            submitBtn,
        );

        this.formAttempted = false;
    
        submitBtn.addEventListener('click', (event) => this.handleSubmit(event, titleInput, categoryInput, dateInput, detailsTextarea, prioritySelect));
    }
    

    createElement(tag, textContent = '') {
        const element = document.createElement(tag);
        element.textContent = textContent;
        return element;
    }

    createPrioritySelect() {
        const select = document.createElement('select');
        const options = [
            { value: 'low', text: 'Low' },
            { value: 'medium', text: 'Medium' },
            { value: 'high', text: 'High' }
        ];

        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.text;
            select.appendChild(option);
        });

        return select;
    }

    handleSubmit(event, titleInput, categoryInput, dateInput, detailsTextarea, prioritySelect) {
        event.preventDefault();
    
        // Track if the form has been submitted
        if (!this.formAttempted) {
            this.formAttempted = true; // Set a flag indicating form submission attempt
        }
    
        const title = titleInput.value.trim();
        const newCategory = categoryInput.value.trim();
        const date = dateInput.value;
        const details = detailsTextarea.value;
        const priority = prioritySelect.value;
    
        // Remove input-error class initially
        titleInput.classList.remove('input-error');
        categoryInput.classList.remove('input-error');
    
        // Validate title input
        if (!title) {
            if (this.formAttempted) {
                titleInput.classList.add('input-error');
                titleInput.placeholder = 'Please enter a title!';
            }
            return; // Stop execution if validation fails
        }
    
        // Validate category input
        if (!newCategory) {
            if (this.formAttempted) {
                categoryInput.classList.add('input-error');
                categoryInput.placeholder = 'Please enter a category!';
            }
            return; // Stop execution if validation fails
        }
    
        // Reset form submission flag for next use
        this.formAttempted = false;
    
        // Create the task object
        const task = { title, date, details, priority, createdAt: new Date() };
    
        if (this.isEditMode) {
            const oldCategory = this.editingCategory;
    
            // Remove the task from the old category
            this.taskData[oldCategory].splice(this.editingTaskIndex, 1);
    
            // If the old category is now empty, delete it
            if (this.taskData[oldCategory].length === 0) {
                delete this.taskData[oldCategory];
                const sidebarList = document.querySelectorAll('#list1 .category-item');
                const oldCategoryElement = Array.from(sidebarList).find((item) => item.textContent === oldCategory);
                if (oldCategoryElement) oldCategoryElement.remove();
            }
    
            // Add the task to the new category
            if (!this.taskData[newCategory]) {
                this.taskData[newCategory] = [];
                this.addCategoryToSidebar(newCategory);
            }
            this.taskData[newCategory].unshift(task);
    
            // Reset edit mode flags
            this.isEditMode = false;
            this.editingTaskIndex = null;
            this.editingCategory = null;
        } else {
            // In create mode: Add a new task
            if (!this.taskData[newCategory]) {
                this.taskData[newCategory] = [];
                this.addCategoryToSidebar(newCategory);
            }
            this.taskData[newCategory].unshift(task);
        }
    
        // Save tasks to localStorage
        this.saveTasks();
    
        // Clear form fields
        titleInput.value = '';
        categoryInput.value = '';
        dateInput.value = '';
        detailsTextarea.value = '';
        prioritySelect.selectedIndex = 0;
    
        // Hide the form only if validation passed
        hideForm();
        this.displayTasksByCategory(newCategory);
    }
    

    addCategoryToSidebar(category) {
        const sidebarList = document.querySelector('#list1');
    
        // Check if the category already exists in the sidebar
        const existingCategory = Array.from(sidebarList.children).find(
            (item) => item.textContent === category
        );
    
        // If the category already exists, do nothing
        if (existingCategory) {
            console.log(`Category "${category}" already exists in the sidebar.`);
            return;
        }
    
        // If the category does not exist, add it to the sidebar
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.textContent = category;
        categoryItem.addEventListener('click', () => this.displayTasksByCategory(category));
        sidebarList.prepend(categoryItem);
    }
    

    displayTasksByCategory(category) {
        const contentContainer = document.querySelector('#content');
        contentContainer.innerHTML = ''; // Clear previous tasks
    
        if (this.taskData[category]) {
            this.taskData[category].forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.classList.add('todo-item');
    
                // Checkbox for marking task as complete
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('task-checkbox');
                checkbox.checked = task.completed || false; // Load saved completed state, if any
    
                if (checkbox.checked) {
                    taskItem.classList.add('checked-off');
                }
    
                checkbox.addEventListener('change', () => {
                    task.completed = checkbox.checked;
                    taskItem.classList.toggle('checked-off', checkbox.checked);
                    this.saveTasks();
                });
    
                // Create each field with consistent width
                const titleField = document.createElement('div');
                titleField.classList.add('todo-field');
                titleField.innerHTML = `<h3 class="title">${task.title || "No Title"}</h3>`;
    
                const dateField = document.createElement('div');
                dateField.classList.add('todo-field');
                dateField.textContent = `Due ${task.date || "date not set"}`;
    
                const priorityField = document.createElement('div');
                priorityField.classList.add('todo-field', 'priority');
                priorityField.textContent = task.priority || "N/A";

                if (task.priority === 'low') {
                    priorityField.classList.add('priority-low');
                } else if (task.priority === 'medium') {
                    priorityField.classList.add('priority-medium');
                } else if (task.priority === 'high') {
                    priorityField.classList.add('priority-high');
                }

                // Details button to open modal with task details
                const detailsButton = this.createElement('button', 'Details');
                detailsButton.classList.add('details-button');
                detailsButton.addEventListener('click', () => this.showTaskDetails(task));

                // Edit button
                const editBtn = this.createElement('button', 'Edit');
                editBtn.classList.add('edit-button');
                editBtn.addEventListener('click', () => this.editTask(category, index));

                // Delete btn
                const deleteBtn = this.createElement('button', '🗑️');
                deleteBtn.classList.add('delete-button');
                deleteBtn.addEventListener('click', () => this.deleteTask(category, index));

    
                // Append elements to task item
                taskItem.append(checkbox, titleField, dateField, priorityField, detailsButton, editBtn, deleteBtn);
                contentContainer.appendChild(taskItem);
            });
        }
    }    

    editTask(category, index) {
        const task = this.taskData[category][index];
    
        if (!task) {
            console.error(`Task not found for category: ${category}, index: ${index}`);
            return;
        }
    
        this.isEditMode = true;
        this.editingTaskIndex = index;
        this.editingCategory = category;
    
        // Open the form with pre-filled values
        this.showEditForm(task, category);
    }
    
    
    showEditForm(task, category) {
        const backgroundOverlay = document.querySelector('#background-overlay');
        const form = document.querySelector('#form');
    
        // Get form elements
        const titleInput = form.querySelector('input[type="text"]');
        const categoryInput = form.querySelector('input[type="text"]:nth-of-type(2)');
        const dateInput = form.querySelector('input[type="date"]');
        const detailsTextarea = form.querySelector('textarea');
        const prioritySelect = form.querySelector('select');
        const submitBtn = form.querySelector('.submit');
    
        // Pre-fill form fields with task data
        titleInput.value = task.title;
        categoryInput.value = category;
        dateInput.value = task.date;
        detailsTextarea.value = task.details;
        prioritySelect.value = task.priority;
        submitBtn.textContent = 'Update';
    
        // Change the submit button action to handle the update
        submitBtn.onclick = (event) => this.handleUpdate(event);
    
        // Show the form and overlay
        backgroundOverlay.style.visibility = 'visible';
        form.style.visibility = 'visible';
    
        requestAnimationFrame(() => {
            backgroundOverlay.style.opacity = '1';
            form.style.opacity = '1';
        });
    }

    handleUpdate(event) {
        event.preventDefault();
    
        if (this.editingCategory === null || this.editingTaskIndex === null) {
            console.error('Edit mode is not properly set. Cannot update task.');
            return;
        }
    
        const form = document.querySelector('#form');
        const titleInput = form.querySelector('input[type="text"]');
        const categoryInput = form.querySelector('input[type="text"]:nth-of-type(2)');
        const dateInput = form.querySelector('input[type="date"]');
        const detailsTextarea = form.querySelector('textarea');
        const prioritySelect = form.querySelector('select');
    
        // Validate title input
        // if (!titleInput.value.trim()) {
        //     titleInput.classList.add('input-error');
        //     titleInput.placeholder = 'Please enter a title!';
        //     return; // Stop execution if validation fails
        // }
    
        // // Validate category input
        // if (!categoryInput.value.trim()) {
        //     categoryInput.classList.add('input-error');
        //     categoryInput.placeholder = 'Please enter a category!';
        //     return; // Stop execution if validation fails
        // }
    
        const updatedTask = {
            title: titleInput.value.trim(),
            date: dateInput.value,
            details: detailsTextarea.value,
            priority: prioritySelect.value,
            createdAt: this.taskData[this.editingCategory][this.editingTaskIndex]?.createdAt || new Date(),
        };
    
        // Update the task data
        this.taskData[this.editingCategory][this.editingTaskIndex] = updatedTask;
    
        // Save updated tasks to localStorage
        this.saveTasks();
    
        // Reset edit mode flags and hide the form
        this.isEditMode = false;
        this.editingTaskIndex = null;
        this.editingCategory = null;
        hideForm();
    
        // Refresh the task list
        this.displayTasksByCategory(this.editingCategory);
    }
    
    

    
    deleteTask(category, index) {
        // Remove the task from the category
        this.taskData[category].splice(index, 1);
    
        // If the category is empty, remove it
        if (this.taskData[category].length === 0) {
            delete this.taskData[category];
    
            // Find and remove the corresponding category element in the sidebar
            const sidebarList = document.querySelector('#list1');
            const categoryItems = Array.from(sidebarList.children);
            const categoryItem = categoryItems.find(item => item.textContent.trim() === category);
    
            if (categoryItem) {
                categoryItem.remove();
            }
        }
    
        // Save updated tasks and refresh the task list
        this.saveTasks();
        this.displayTasksByCategory(category);
    }
    
    

    saveTasks() {
        localStorage.setItem('tasks',JSON.stringify(this.taskData));
    }

    loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            this.taskData = JSON.parse(storedTasks);
            for (const category in this.taskData) {
                this.addCategoryToSidebar(category);
            }
        }
    }
    

    createModal() {
        // Create the modal structure
        this.modal = document.createElement('div');
        this.modal.classList.add('modal');
        this.modal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        this.modalTitle = document.createElement('p');
        this.modalDate = document.createElement('p');
        this.modalDetails = document.createElement('p');
        this.modalPriority = document.createElement('p');


        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => this.closeModal());

        modalContent.append(this.modalTitle, this.modalDate, this.modalDetails, this.modalPriority, closeButton);
        this.modal.appendChild(modalContent);
        document.body.appendChild(this.modal);
    }

    showTaskDetails(task) {
        // Populate the modal with task details
        this.modalTitle.innerHTML = `<strong><em>Task:</em></strong> ${task.title}`;
        this.modalDate.innerHTML = `<strong><em>Due Date:</em></strong> ${task.date}`;
        this.modalDetails.innerHTML = `<strong><em>Details:</em></strong> ${task.details}`;
        this.modalPriority.innerHTML = `<strong><em>Priority:</em></strong> ${task.priority}`;
        
        
        // Show the modal
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }
}
