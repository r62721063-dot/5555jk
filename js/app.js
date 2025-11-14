// Game State
const gameState = {
    money: 0,
    moneyPerClick: 1,
    moneyPerSecond: 0,
    businesses: [
        { id: 'stand', name: 'Barraca de Limonada', basePrice: 15, baseIncome: 0.1, owned: 0, multiplier: 1 },
        { id: 'store', name: 'Loja de Conveniência', basePrice: 100, baseIncome: 1, owned: 0, multiplier: 1 },
        { id: 'factory', name: 'Fábrica', basePrice: 1100, baseIncome: 8, owned: 0, multiplier: 1 },
        { id: 'bank', name: 'Banco', basePrice: 12000, baseIncome: 47, owned: 0, multiplier: 1 },
        { id: 'mine', name: 'Mineração', basePrice: 130000, baseIncome: 260, owned: 0, multiplier: 1 },
        { id: 'multinational', name: 'Multinacional', basePrice: 1400000, baseIncome: 1400, owned: 0, multiplier: 1 },
    ],
    upgrades: [
        { id: 'click1', name: 'Luvas de Trabalho', description: 'Dobra o dinheiro por clique', price: 100, type: 'click', multiplier: 2, purchased: false },
        { id: 'stand1', name: 'Melhor Receita', description: 'Dobra a renda da Barraca de Limonada', price: 500, type: 'business', businessId: 'stand', multiplier: 2, purchased: false },
        { id: 'click2', name: 'Máquina de Contar', description: 'Triplica o dinheiro por clique', price: 5000, type: 'click', multiplier: 3, purchased: false },
        { id: 'global1', name: 'Marketing Viral', description: 'Aumenta toda renda em 10%', price: 10000, type: 'global', multiplier: 1.1, purchased: false },
    ],
    achievements: [
        { id: 'first_click', name: 'Primeiro Milhão', description: 'Ganhe $1,000,000', goal: 1000000, achieved: false },
        { id: 'first_business', name: 'Empreendedor', description: 'Compre seu primeiro empreendimento', goal: 1, achieved: false },
        { id: 'ten_businesses', name: 'Magnata', description: 'Tenha 10 empreendimentos no total', goal: 10, achieved: false },
    ],
    prestigePoints: 0,
    prestigeBonus: 1,
    lastUpdate: Date.now(),
};

// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const rpsDisplay = document.getElementById('rps-display');
const clickBtn = document.getElementById('click-btn');
const businessesContainer = document.getElementById('businesses-container');
const upgradesContainer = document.getElementById('upgrades-container');
const achievementsContainer = document.getElementById('achievements-container');
const prestigePointsDisplay = document.getElementById('prestige-points');
const prestigeBonusDisplay = document.getElementById('prestige-bonus');
const prestigeBtn = document.getElementById('prestige-btn');
const prestigeConfirmBtn = document.getElementById('prestige-confirm-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const clickEffect = document.getElementById('click-effect');
const eventNotification = document.getElementById('event-notification');
const eventMessage = document.getElementById('event-message');

// Game Functions
function formatMoney(amount) {
    if (amount < 1000) return `$${amount.toFixed(2)}`;
    if (amount < 1000000) return `$${(amount/1000).toFixed(2)}K`;
    if (amount < 1000000000) return `$${(amount/1000000).toFixed(2)}M`;
    if (amount < 1000000000000) return `$${(amount/1000000000).toFixed(2)}B`;
    return `$${(amount/1000000000000).toFixed(2)}T`;
}

function calculateBusinessPrice(basePrice, owned) {
    return Math.floor(basePrice * Math.pow(1.15, owned));
}

function updateDisplays() {
    moneyDisplay.textContent = formatMoney(gameState.money);
    rpsDisplay.textContent = `${formatMoney(gameState.moneyPerSecond)} por segundo`;
    prestigePointsDisplay.textContent = gameState.prestigePoints;
    prestigeBonusDisplay.textContent = `${(gameState.prestigeBonus * 100).toFixed(0)}%`;
}

function calculateIncome() {
    let income = 0;
    gameState.businesses.forEach(business => {
        income += business.owned * business.baseIncome * business.multiplier * gameState.prestigeBonus;
    });
    gameState.moneyPerSecond = income;
}

function updateBusinesses() {
    businessesContainer.innerHTML = '';
    gameState.businesses.forEach(business => {
        const price = calculateBusinessPrice(business.basePrice, business.owned);
        
        const businessCard = document.createElement('div');
        businessCard.className = 'business-card';
        businessCard.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">${business.name}</h3>
                <span class="text-emerald-400">${formatMoney(business.owned * business.baseIncome * business.multiplier * gameState.prestigeBonus)}/s</span>
            </div>
            <div class="flex justify-between items-center mb-2">
                <span class="text-gray-400">Possuídos: ${business.owned}</span>
                <span class="font-bold">${formatMoney(price)}</span>
            </div>
            <div class="flex space-x-2 mb-2">
                <button class="buy-btn bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded" data-id="${business.id}" data-amount="1">Comprar 1</button>
                <button class="buy-btn bg-emerald-700 hover:bg-emerald-800 px-3 py-1 rounded" data-id="${business.id}" data-amount="10">Comprar 10</button>
                <button class="buy-btn bg-emerald-800 hover:bg-emerald-900 px-3 py-1 rounded" data-id="${business.id}" data-amount="100">Comprar 100</button>
            </div>
            <div class="progress-bar">
                <div class="progress" data-id="${business.id}"></div>
            </div>
        `;
        businessesContainer.appendChild(businessCard);
    });
}

function updateUpgrades() {
    upgradesContainer.innerHTML = '';
    gameState.upgrades.forEach(upgrade => {
        const upgradeCard = document.createElement('div');
        upgradeCard.className = `upgrade-card ${gameState.money < upgrade.price || upgrade.purchased ? 'disabled' : ''}`;
        upgradeCard.innerHTML = `
            <div class="flex-1">
                <h3 class="font-bold">${upgrade.name}</h3>
                <p class="text-gray-400 text-sm">${upgrade.description}</p>
            </div>
            <button class="upgrade-btn bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded ${upgrade.purchased ? 'hidden' : ''}" 
                    data-id="${upgrade.id}" ${gameState.money < upgrade.price ? 'disabled' : ''}>
                ${formatMoney(upgrade.price)}
            </button>
            <div class="text-amber-400 ${!upgrade.purchased ? 'hidden' : ''}">
                <i data-feather="check-circle"></i>
            </div>
        `;
        upgradesContainer.appendChild(upgradeCard);
    });
}

function updateAchievements() {
    achievementsContainer.innerHTML = '';
    gameState.achievements.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${achievement.achieved ? '' : 'locked'}`;
        achievementCard.innerHTML = `
            <div class="icon">
                <i data-feather="${achievement.achieved ? 'award' : 'lock'}"></i>
            </div>
            <div class="flex-1">
                <h3 class="font-bold">${achievement.name}</h3>
                <p class="text-gray-400 text-sm">${achievement.description}</p>
            </div>
        `;
        achievementsContainer.appendChild(achievementCard);
    });
}

function handleBusinessPurchase(businessId, amount) {
    const business = gameState.businesses.find(b => b.id === businessId);
    if (!business) return;

    const price = calculateBusinessPrice(business.basePrice, business.owned);
    const totalPrice = price * (1 - Math.pow(1.15, amount)) / (1 - 1.15); // Geometric series sum

    if (gameState.money >= totalPrice) {
        gameState.money -= totalPrice;
        business.owned += amount;
        
        // Check achievements
        checkAchievements();
        
        calculate