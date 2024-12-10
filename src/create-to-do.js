
function createToDo(toDoFormInstance) {
    const addButton = document.querySelector('#add-button');

    addButton.addEventListener('click', () => showForm(toDoFormInstance));
    document.body.addEventListener("click", handleOverlayClick);
}

function showForm(toDoFormInstance, task = null, category = '') {
    const backgroundOverlay = document.querySelector('#background-overlay');
    const form = document.querySelector('#form');

    // Get form elements
    const titleInput = form.querySelector('input[type="text"]');
    const categoryInput = form.querySelector('input[type="text"]:nth-of-type(2)');
    const dateInput = form.querySelector('input[type="date"]');
    const detailsTextarea = form.querySelector('textarea');
    const prioritySelect = form.querySelector('select');
    const submitBtn = form.querySelector('.submit');

    // Check if this is edit mode (task is provided)
    const isEditMode = task !== null;

    if (isEditMode) {
        // Edit mode: Pre-fill form fields with task data
        titleInput.value = task?.title || '';
        categoryInput.value = category || '';
        dateInput.value = task?.date || '';
        detailsTextarea.value = task?.details || '';
        prioritySelect.value = task?.priority || 'low';
        submitBtn.textContent = 'Update';
        submitBtn.onclick = (event) => toDoFormInstance.handleUpdate(event);
    } else {
        // Create mode: Reset form fields
        titleInput.value = '';
        categoryInput.value = '';
        dateInput.value = '';
        detailsTextarea.value = '';
        prioritySelect.selectedIndex = 0;
        submitBtn.textContent = 'Submit';
        submitBtn.onclick = (event) => toDoFormInstance.handleSubmit(event, titleInput, categoryInput, dateInput, detailsTextarea, prioritySelect);
    }

    // Show the form with overlay
    backgroundOverlay.style.visibility = 'visible';
    form.style.visibility = 'visible';

    requestAnimationFrame(() => {
        backgroundOverlay.style.opacity = '1';
        form.style.opacity = '1';
    });
}


function hideForm() {
    const backgroundOverlay = document.querySelector('#background-overlay');
    const form = document.querySelector('#form');

    backgroundOverlay.style.opacity = '0';
    form.style.opacity = '0';

    setTimeout(() => {
        backgroundOverlay.style.visibility = 'hidden';
        form.style.visibility = 'hidden';
    }, 300); // Match the transition duration for opacity
}

function handleOverlayClick(event) {
    const backgroundOverlay = document.querySelector('#background-overlay');

    if (event.target === backgroundOverlay) {
        hideForm();
    }
}

export { createToDo, hideForm, showForm };