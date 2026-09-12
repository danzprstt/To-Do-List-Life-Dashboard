document.addEventListener('DOMContentLoaded', () => {
  // 1. GREETING & CLOCK
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const greetingTextEl = document.getElementById('greeting-text');
  const nameInput = document.getElementById('name-input');
  const saveNameBtn = document.getElementById('save-name-btn');

  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);

    const hours = now.getHours();
    let timeGreeting = 'Good Morning';
    if (hours >= 12 && hours < 17) timeGreeting = 'Good Afternoon';
    else if (hours >= 17) timeGreeting = 'Good Evening';

    const savedName = localStorage.getItem('dashboard_user_name') || '';
    greetingTextEl.textContent = savedName ? `${timeGreeting}, ${savedName}` : timeGreeting;
  }

  saveNameBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    localStorage.setItem('dashboard_user_name', name);
    updateClock();
  });

  const storedName = localStorage.getItem('dashboard_user_name');
  if (storedName) nameInput.value = storedName;
  setInterval(updateClock, 1000);
  updateClock();

  // 2. FOCUS TIMER (25 mins)
  let timerInterval = null;
  let timeLeft = 25 * 60;
  const timerDisplay = document.getElementById('timer-display');

  function renderTimer() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }

  document.getElementById('start-timer').addEventListener('click', () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        alert('Focus time is up!');
      }
    }, 1000);
  });

  document.getElementById('stop-timer').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
  });

  document.getElementById('reset-timer').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    renderTimer();
  });

  // 3. TO-DO LIST (With Challenge: Prevent Duplicate Tasks)
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

  function saveAndRenderTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        tasks[index].completed = checkbox.checked;
        saveAndRenderTasks();
      });

      const span = document.createElement('span');
      span.textContent = task.text;

      label.appendChild(checkbox);
      label.appendChild(span);

      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
          tasks[index].text = newText.trim();
          saveAndRenderTasks();
        }
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'btn-delete';
      delBtn.addEventListener('click', () => {
        tasks.splice(index, 1);
        saveAndRenderTasks();
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(label);
      li.appendChild(actions);
      todoList.appendChild(li);
    });
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (!taskText) return;

    // Challenge: Prevent duplicate tasks
    const isDuplicate = tasks.some(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (isDuplicate) {
      alert('Task already exists!');
      return;
    }

    tasks.push({ text: taskText, completed: false });
    todoInput.value = '';
    saveAndRenderTasks();
  });

  saveAndRenderTasks();

  // 4. QUICK LINKS
  const linkForm = document.getElementById('link-form');
  const linkNameInput = document.getElementById('link-name');
  const linkUrlInput = document.getElementById('link-url');
  const linksContainer = document.getElementById('links-container');
  let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'Gmail', url: 'https://mail.google.com' }
  ];

  function saveAndRenderLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
    linksContainer.innerHTML = '';
    quickLinks.forEach((link, index) => {
      const chip = document.createElement('div');
      chip.className = 'link-chip';

      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.textContent = link.name;
      a.style.color = '#fff';
      a.style.textDecoration = 'none';

      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        quickLinks.splice(index, 1);
        saveAndRenderLinks();
      });

      chip.appendChild(a);
      chip.appendChild(delBtn);
      linksContainer.appendChild(chip);
    });
  }

  linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    quickLinks.push({ name, url });
    linkNameInput.value = '';
    linkUrlInput.value = '';
    saveAndRenderLinks();
  });

  saveAndRenderLinks();

  // 5. CHALLENGE: LIGHT / DARK MODE TOGGLE
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('dashboard_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dashboard_theme', newTheme);
  });
});
