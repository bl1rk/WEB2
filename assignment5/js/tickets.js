const events = [
    {
        id: "music",
        title: "Music Night",
        dates: ["2026-11-15", "2026-11-16"],
        soldOut: "2026-11-16"
    },
    {
        id: "movie",
        title: "Movie Night",
        dates: ["2026-11-20", "2026-11-21"],
        soldOut: "2026-11-21"
    }
];

const ticketTypes = [
    { id: "standard", title: "Standard", price: 3000, seatsLeft: 20 },
    { id: "vip", title: "VIP", price: 7000, seatsLeft: 5 }
];

const promos = [{ code: "STUDENT10", discount: 10 }];
const form = document.querySelector("#ticket-form");
const fields = Array.from(form.querySelectorAll("input, select"));
const touched = new Set();

let submitted = false;
form.noValidate = true;

function get(id) {
    return document.getElementById(id);
}

function readForm() {
    const data = {};

    for (const field of fields) {
        data[field.id] = field.value.trim();
    }

    data.eventInfo = events.find(item => item.id === data.event);
    data.ticket = ticketTypes.find(item => item.id === data.type);
    data.promoInfo = promos.find(
        item => item.code === data.promo.toUpperCase()
    );

    return data;
}

function getError(field, data) {
    if (field.required && data[field.id] === "") {
        return "This field is required.";
    }

    if (field.validity.typeMismatch) {
        return "Enter a valid email address.";
    }

    if (field.id === "quantity" && !field.checkValidity()) {
        return "Enter a whole number of at least 1.";
    }

    if (!field.checkValidity()) return "Enter a valid value.";

    if (field.id === "name" && data.name.length < 2) {
        return "Enter at least 2 characters.";
    }

    if (field.id === "date" && data.eventInfo) {
        if (!data.eventInfo.dates.includes(data.date)) {
            return "Choose one of the available dates below.";
        }

        if (data.date === data.eventInfo.soldOut) {
            return "This date is sold out.";
        }
    }

    if (
        field.id === "quantity" &&
        data.ticket &&
        Number(data.quantity) > data.ticket.seatsLeft
    ) {
        return `Only ${data.ticket.seatsLeft} seats are left.`;
    }

    if (field.id === "promo" && data.promo && !data.promoInfo) {
        return "Unknown promo code.";
    }

    return "";
}

function draw(id, lines) {
    get(id).textContent = "";

    for (const line of lines) {
        const p = document.createElement("p");
        p.textContent = line;
        get(id).appendChild(p);
    }
}

function update() {
    const data = readForm();
    const errors = [];

    for (const field of fields) {
        const error = getError(field, data);

        if (error) errors.push(field);

        const show = touched.has(field.id) || submitted;

        get(field.id + "-error").textContent = show ? error : "";
        field.classList.toggle("invalid", show && error !== "");
        field.setAttribute("aria-invalid", String(show && error !== ""));
    }

    get("error-summary").textContent = submitted && errors.length
        ? `Please fix ${errors.length} field(s).` : "";

    get("date-help").textContent = data.eventInfo
        ? `Event dates: ${data.eventInfo.dates.join(", ")}. Sold out: ${data.eventInfo.soldOut}`
        : "Choose an event.";

    get("quantity-help").textContent = data.ticket
        ? `Seats left: ${data.ticket.seatsLeft}`
        : "Choose a ticket type.";

    let total = "—";

    if (
        data.ticket &&
        !errors.includes(get("quantity")) &&
        !errors.includes(get("promo"))
    ) {
        const discount = data.promoInfo ? data.promoInfo.discount : 0;

        total = (
            data.ticket.price * Number(data.quantity) *
            (1 - discount / 100)
        ).toFixed(0) + " KZT";
    }

    const lines = [
        "Event: " + (data.eventInfo ? data.eventInfo.title : "Not selected"),
        "Date: " + (data.date || "Not selected"),
        "Type: " + (data.ticket ? data.ticket.title : "Not selected"),
        "Quantity: " + (data.quantity || "Not entered"),
        "Name: " + (data.name || "Not entered"),
        "Email: " + (data.email || "Not entered"),
        "Promo: " + (data.promo.toUpperCase() || "None"),
        "Total: " + total
    ];

    draw("preview", lines);
    return { errors, lines };
}

for (const field of fields) {
    field.addEventListener("blur", function () {
        touched.add(field.id);
        update();
    });
}

form.addEventListener("input", update);
form.addEventListener("change", update);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitted = true;

    const result = update();

    if (result.errors.length) {
        result.errors[0].focus();
        return;
    }

    const code = "BK-" + (Math.floor(Math.random() * 900000) + 100000);

    draw("ticket-result", [
        "Booking confirmed",
        "Booking code: " + code,
        ...result.lines
    ]);

    get("ticket-result").hidden = false;

    form.reset();
    touched.clear();
    submitted = false;
    update();
});

update();