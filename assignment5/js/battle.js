const MAX_HP = 100, MAX_HEALS = 3, HEAL_AMOUNT = 20;
const HERO_DAMAGE_MIN = 8, HERO_DAMAGE_MAX = 15;
const ENEMY_DAMAGE_MIN = 5, ENEMY_DAMAGE_MAX = 14;
const CRITICAL_CHANCE = 0.1, CRITICAL_MULTIPLIER = 2;
const DEFENSE_DIVISOR = 2, LOG_LIMIT = 5;

let heroHp, enemyHp, healsRemaining, isDefending, isGameOver;
const battleLog = [];

function getElement(id) {
    return document.getElementById(id);
}
function showMessage(message) {
    getElement("battle-result").textContent = message;
}
function canAct() {
    if (isGameOver) showMessage("The game is over. Press Restart to play again.");
    return !isGameOver;
}
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rollDamage(name, min, max, defending = false) {
    let damage = getRandomInteger(min, max);
    let note = "";
    if (Math.random() < CRITICAL_CHANCE) {
        damage *= CRITICAL_MULTIPLIER;
        note = " Critical hit!";
    }
    if (defending) {
        damage = Math.floor(damage / DEFENSE_DIVISOR);
        note += " Reduced by defense.";
    }
    addLog(`${name} attacks for ${damage} damage.${note}`);
    return damage;
}
function handleAttack() {
    if (!canAct()) return;
    const damage = rollDamage("Hero", HERO_DAMAGE_MIN, HERO_DAMAGE_MAX);
    enemyHp = Math.max(0, enemyHp - damage);
    finishTurn();
}
function handleDefend() {
    if (!canAct()) return;
    isDefending = true;
    addLog("Hero defends against the next hit.");
    finishTurn();
}
function handleHeal() {
    if (!canAct()) return;
    if (healsRemaining === 0 || heroHp >= MAX_HP) {
        showMessage("Cannot heal: no heals left or health is full.");
        return;
    }
    const healed = Math.min(HEAL_AMOUNT, MAX_HP - heroHp);
    heroHp += healed;
    healsRemaining -= 1;
    addLog(`Hero restores ${healed} HP.`);
    finishTurn();
}
function finishTurn() {
    checkGameOver();
    if (!isGameOver) enemyTurn();
    renderBattle();
}
function enemyTurn() {
    if (isGameOver) return;
    const damage = rollDamage("Enemy", ENEMY_DAMAGE_MIN, ENEMY_DAMAGE_MAX, isDefending);
    heroHp = Math.max(0, heroHp - damage);
    isDefending = false;
    checkGameOver();
}
function checkGameOver() {
    if (isGameOver) return;
    if (enemyHp <= 0 || heroHp <= 0) {
        isGameOver = true;
        addLog(enemyHp <= 0 ? "You won!" : "You lost!");
    }
}
function addLog(message) {
    battleLog.push(message);
    if (battleLog.length > LOG_LIMIT) battleLog.shift();
}
function renderBattle() {
    for (const name of ["hero", "enemy"]) {
        const hp = name === "hero" ? heroHp : enemyHp;
        getElement(`${name}-health`).max = MAX_HP;
        getElement(`${name}-health`).value = hp;
        getElement(`${name}-health-text`).textContent = `HP: ${hp} / ${MAX_HP}`;
    }
    getElement("heals-remaining").textContent = `Heals remaining: ${healsRemaining}`;
    let result = "";
    if (isGameOver) result = enemyHp <= 0 ? "You won!" : "You lost!";
    showMessage(result);
    getElement("attack-button").disabled = isGameOver;
    getElement("defend-button").disabled = isGameOver;
    getElement("heal-button").disabled = isGameOver || healsRemaining === 0 || heroHp >= MAX_HP;
    const list = getElement("battle-log");
    list.textContent = "";
    for (const message of battleLog) {
        const item = document.createElement("li");
        item.textContent = message;
        list.appendChild(item);
    }
}
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

getElement("attack-button").addEventListener("click", handleAttack);
getElement("defend-button").addEventListener("click", handleDefend);
getElement("heal-button").addEventListener("click", handleHeal);
getElement("restart-button").addEventListener("click", restartGame);
restartGame();
