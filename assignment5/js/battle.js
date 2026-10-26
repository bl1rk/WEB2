const MAX_HP = 100;

const HERO_DAMAGE_MIN = 8;
const HERO_DAMAGE_MAX = 15;

const ENEMY_DAMAGE_MIN = 5;
const ENEMY_DAMAGE_MAX = 14;

const HEAL_AMOUNT = 20;
const MAX_HEALS = 3;

const CRITICAL_CHANCE = 0.1;
const CRITICAL_MULTIPLIER = 2;
const DEFENSE_DIVISOR = 2;

const LOG_LIMIT = 5;

let heroHp = MAX_HP;
let enemyHp = MAX_HP;
let healsRemaining = MAX_HEALS;
let isDefending = false;
let isGameOver = false;

const battleLog = [];


function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Сообщение на странице
function showMessage(message) {
    document.querySelector("#battle-result").textContent = message;
}


// Атака героя
function handleAttack() {
    if (isGameOver) {
        showMessage("The game is over. Press Restart to play again.");
        return;
    }

    let damage = getRandomInteger(HERO_DAMAGE_MIN, HERO_DAMAGE_MAX);
    let criticalText = "";

    if (Math.random() < CRITICAL_CHANCE) {
        damage *= CRITICAL_MULTIPLIER;
        criticalText = " Critical hit!";
    }

    enemyHp = Math.max(0, enemyHp - damage);

    addLog(`Hero attacks for ${damage} damage.${criticalText}`);

    finishTurn();
}


// Защита героя
function handleDefend() {
    if (isGameOver) {
        showMessage("The game is over. Press Restart to play again.");
        return;
    }

    isDefending = true;

    addLog("Hero defends against the next hit.");

    finishTurn();
}


// Лечение героя
function handleHeal() {
    if (isGameOver) {
        showMessage("The game is over. Press Restart to play again.");
        return;
    }

    if (healsRemaining === 0 || heroHp >= MAX_HP) {
        showMessage("Cannot heal: no heals left or health is full.");
        return;
    }

    const previousHp = heroHp;

    heroHp = Math.min(heroHp + HEAL_AMOUNT, MAX_HP);
    healsRemaining -= 1;

    addLog(`Hero restores ${heroHp - previousHp} HP.`);

    finishTurn();
}


// Завершение успешного действия героя
function finishTurn() {
    checkGameOver();

    if (!isGameOver) {
        enemyTurn();
    }

    renderBattle();
}


// Ответный удар противника
function enemyTurn() {
    if (isGameOver) {
        return;
    }

    let damage = getRandomInteger(ENEMY_DAMAGE_MIN, ENEMY_DAMAGE_MAX);
    let criticalText = "";
    let defenseText = "";

    if (Math.random() < CRITICAL_CHANCE) {
        damage *= CRITICAL_MULTIPLIER;
        criticalText = " Critical hit!";
    }

    if (isDefending) {
        damage = Math.floor(damage / DEFENSE_DIVISOR);
        defenseText = " Reduced by defense.";
    }

    heroHp = Math.max(0, heroHp - damage);

    // Защита действует только на один удар
    isDefending = false;

    addLog(
        `Enemy attacks for ${damage} damage.${criticalText}${defenseText}`
    );

    checkGameOver();
}


// Проверка окончания боя
function checkGameOver() {
    if (isGameOver) {
        return;
    }

    if (enemyHp <= 0) {
        isGameOver = true;
        addLog("You won!");
    } else if (heroHp <= 0) {
        isGameOver = true;
        addLog("You lost!");
    }
}


// Добавление записи в историю
function addLog(message) {
    battleLog.push(message);

    if (battleLog.length > LOG_LIMIT) {
        battleLog.shift();
    }
}


// Обновление страницы
function renderBattle() {
    const heroHealth = document.querySelector("#hero-health");
    const enemyHealth = document.querySelector("#enemy-health");

    heroHealth.max = MAX_HP;
    heroHealth.value = heroHp;

    enemyHealth.max = MAX_HP;
    enemyHealth.value = enemyHp;

    document.querySelector("#hero-health-text").textContent =
        `HP: ${heroHp} / ${MAX_HP}`;

    document.querySelector("#enemy-health-text").textContent =
        `HP: ${enemyHp} / ${MAX_HP}`;

    document.querySelector("#heals-remaining").textContent =
        `Heals remaining: ${healsRemaining}`;

    if (isGameOver && enemyHp <= 0) {
        showMessage("You won!");
    } else if (isGameOver && heroHp <= 0) {
        showMessage("You lost!");
    } else {
        showMessage("");
    }

    document.querySelector("#attack-button").disabled = isGameOver;
    document.querySelector("#defend-button").disabled = isGameOver;

    document.querySelector("#heal-button").disabled =
        isGameOver || healsRemaining === 0 || heroHp >= MAX_HP;

    const logList = document.querySelector("#battle-log");

    logList.textContent = "";

    for (const message of battleLog) {
        const item = document.createElement("li");
        item.textContent = message;
        logList.appendChild(item);
    }
}


// Начало новой игры
function restartGame() {
    heroHp = MAX_HP;
    enemyHp = MAX_HP;
    healsRemaining = MAX_HEALS;

    isDefending = false;
    isGameOver = false;

    battleLog.length = 0;

    addLog("A new battle begins!");

    renderBattle();
}


// Подключение кнопок — выполняется один раз
document.querySelector("#attack-button")
    .addEventListener("click", handleAttack);

document.querySelector("#defend-button")
    .addEventListener("click", handleDefend);

document.querySelector("#heal-button")
    .addEventListener("click", handleHeal);

document.querySelector("#restart-button")
    .addEventListener("click", restartGame);


// Подготовка игры при загрузке страницы
restartGame();