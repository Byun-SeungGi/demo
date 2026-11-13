const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const remaining = document.getElementById('remaining');
const copyBtn = document.getElementById('copy-btn');

let todos = [];
try {
  todos = JSON.parse(localStorage.getItem('todos')) || [];
} catch (e) {
  todos = [];
}

function save() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (e) {}
}

function render() {
  list.innerHTML = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.textContent = todo.text;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '✕';
    del.setAttribute('aria-label', '삭제');
    del.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const left = todos.filter((t) => !t.done).length;
  remaining.textContent = `남은 할 일: ${left}개`;
}

function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

// 할 일 목록을 "[ ] 내용" / "[x] 내용" 형태의 텍스트로 만든다
function todosToText() {
  return todos.map((t) => `[${t.done ? 'x' : ' '}] ${t.text}`).join('\n');
}

// 클립보드 API를 못 쓰는 환경을 위한 대체 복사 방법
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  return ok;
}

async function copyTodos() {
  if (!todos.length) {
    showCopyResult('복사할 할 일이 없어요');
    return;
  }
  const text = todosToText();
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (e) {
    ok = fallbackCopy(text);
  }
  showCopyResult(ok ? '복사됨!' : '복사 실패');
}

let copyTimer;
function showCopyResult(message) {
  copyBtn.textContent = message;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (copyBtn.textContent = '목록 복사'), 1500);
}

copyBtn.addEventListener('click', copyTodos);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
  input.focus();
});

render();
