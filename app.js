const SID4 = '6092';


function createStore(storageKey) {
  let state = [];

 
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(data)) state = data;
  } catch {
    state = [];
  }

  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));

  return {
    add(task) {
      state = [...state, task];
      save();
      return [...state];
    },
    toggle(id) {
      state = state.map(t => t.id === id ? { ...t, done: !t.done } : t);
      save();
      return [...state];
    },
    remove(id) {
      state = state.filter(t => t.id !== id);
      save();
      return [...state];
    },
    list() {
      return JSON.parse(JSON.stringify(state));
    }
  };
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])
  );
}

const store = createStore(`focustasks_${SID4}`);
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const errorEl = document.getElementById('error');
const activeList = document.getElementById('active-list');
const doneList = document.getElementById('done-list');
const analytics = document.getElementById('analytics');

function summarize(tasks) {
  const active = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;
  const total = active + done;
  const pct = total === 0 ? 0 : ((done / total) * 100).toFixed(1);
  return { active, done, pct };
}

function renderAnalytics() {
  const s = summarize(store.list());
  analytics.textContent = `Active: ${s.active} · Done: ${s.done} · Done %: ${s.pct}%`;
}

function buildTask(task) {
  const li = document.createElement('li');
  li.className = 'task';
  li.dataset.id = task.id;

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'task-toggle';
  cb.checked = task.done;
  cb.setAttribute('aria-label', escapeHTML(task.title)); 

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  const del = document.createElement('button');
  del.className = 'small-btn delete-btn';
  del.textContent = 'Delete';

  li.append(cb, title, del);
  return li;
}

function render() {
  const tasks = store.list();
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  activeList.innerHTML = '';
  doneList.innerHTML = '';

  const makeFrag = arr => arr.reduce((f, t) => (f.appendChild(buildTask(t)), f), document.createDocumentFragment());
  activeList.appendChild(makeFrag(active));
  doneList.appendChild(makeFrag(done));
  renderAnalytics();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) {
    errorEl.textContent = 'Please enter a valid task.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  store.add({ id: Date.now().toString(36), title, done: false });
  input.value = '';
  render();
});

document.getElementById('main').addEventListener('click', e => {
  const row = e.target.closest('.task');
  if (!row) return;
  const id = row.dataset.id;

  if (e.target.matches('.delete-btn')) {
    store.remove(id);
  }
  if (e.target.matches('.task-toggle')) {
    store.toggle(id);
  }
  render();
});

render();

/* 
#1 Closure store (lines near createStore)
The closure hides the task array inside createStore, avoiding globals. 
This prevents accidental edits and makes the store easier to test.
*/

/* 
#2 Escaping (see escapeHTML + buildTaskNode)
We use textContent to stop HTML injection—safe for client use. 
Server apps need backend sanitizing + CSP for full protection.
*/
