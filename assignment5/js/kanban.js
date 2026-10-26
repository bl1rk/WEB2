const LIMIT = 3;
const statuses = ["todo", "in-progress", "done"];
const buttons = ["Start", "Complete", "Reset"];

const tasks = [
    { id: 1, title: "Buy groceries", status: "todo", priority: 3, tags: ["shopping"], urgent: true },
    { id: 2, title: "Clean my room", status: "todo", priority: 2, tags: ["home"], urgent: false },
    { id: 3, title: "Do homework", status: "in-progress", priority: 3, tags: ["study"], urgent: true },
    { id: 4, title: "Wash clothes", status: "todo", priority: 1, tags: ["home"], urgent: false },
    { id: 5, title: "Read a book", status: "todo", priority: 1, tags: ["personal"], urgent: false },
    { id: 6, title: "Go for a walk", status: "in-progress", priority: 2, tags: ["health"], urgent: false },
    { id: 7, title: "Cook dinner", status: "todo", priority: 2, tags: ["home"], urgent: false },
    { id: 8, title: "Drink water", status: "done", priority: 1, tags: ["health"], urgent: false },
    { id: 9, title: "Call my parents", status: "todo", priority: 2, tags: ["family"], urgent: false },
    { id: 10, title: "Make my bed", status: "done", priority: 1, tags: ["home"], urgent: false }
];

const board = document.querySelector("#kanban-board");
const search = document.querySelector("#search-input");
const sort = document.querySelector("#sort-select");
const message = document.querySelector("#board-message");

function count(status) {
    let total = 0;
    for (const task of tasks) {
        if (task.status === status) total++;
    }
    return total;
}

function make(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
}

function render() {
    message.textContent = "";
    for (const box of board.querySelectorAll(".cards-container")) {
        box.textContent = "";
    }

    const query = search.value.trim().toLowerCase();
    const visible = tasks.filter(task =>
        task.tags.join(" ").toLowerCase().includes(query)
    );

    const direction = sort.value === "low-first" ? 1 : -1;
    visible.sort((a, b) => (a.priority - b.priority) * direction);

    for (const task of visible) {
        const card = make("article", "");
        card.classList.add("card");
        card.classList.toggle("is-done", task.status === "done");

        const info = `Priority: ${task.priority} | Tags: ${task.tags.join(", ")}`;
        const button = make("button", buttons[statuses.indexOf(task.status)]);
        button.type = "button";
        button.dataset.id = task.id;

        card.append(
            make("h3", task.title),
            make("p", info + (task.urgent ? " | Urgent" : "")),
            button
        );

        board.querySelector(
            `[data-status="${task.status}"] .cards-container`
        ).append(card);
    }

    document.querySelector("#empty-message").hidden = visible.length !== 0;
    document.querySelector(".progress-count").textContent = count("in-progress");
    document.querySelector("#progress-limit").textContent = LIMIT;

    const done = count("done");
    const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;

    document.querySelector("#completion-progress").value = percent;
    document.querySelector("#completion-text").textContent =
        `${done} of ${tasks.length} completed (${percent}%)`;
}

board.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-id]");
    if (!button || !board.contains(button)) return;

    const task = tasks.find(task => task.id === Number(button.dataset.id));
    if (!task) return;

    const next = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];

    if (next === "in-progress" && count(next) >= LIMIT) {
        message.textContent =
            `Only ${LIMIT} tasks allowed in In Progress. Complete one first.`;
        return;
    }

    task.status = next;
    render();
    board.querySelector(`button[data-id="${task.id}"]`).focus();
});

search.addEventListener("input", render);
sort.addEventListener("change", render);
render();