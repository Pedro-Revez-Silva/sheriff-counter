"use strict";
class Game {
    constructor() {
        this.goods = [
            { name: 'apples', type: 'regular', value: 2, kingBonus: 20, queenBonus: 10 },
            { name: 'cheese', type: 'regular', value: 3, kingBonus: 15, queenBonus: 10 },
            { name: 'bread', type: 'regular', value: 3, kingBonus: 15, queenBonus: 10, minPlayers: 4 },
            { name: 'chickens', type: 'regular', value: 4, kingBonus: 10, queenBonus: 5 },
            { name: 'pepper', type: 'contraband', value: 6 },
            { name: 'mead', type: 'contraband', value: 7 },
            { name: 'silk', type: 'contraband', value: 8 },
            { name: 'crossbow', type: 'contraband', value: 9 },
            { name: 'green apples', type: 'royal', value: 4, minPlayers: 4, countAs: { good: 'apples', multiplier: 2 } },
            { name: 'golden apples', type: 'royal', value: 6, minPlayers: 4, countAs: { good: 'apples', multiplier: 3 } },
            { name: 'gouda cheese', type: 'royal', value: 6, minPlayers: 4, countAs: { good: 'cheese', multiplier: 2 } },
            { name: 'bleu cheese', type: 'royal', value: 9, minPlayers: 4, countAs: { good: 'cheese', multiplier: 3 } },
            { name: 'rye bread', type: 'royal', value: 6, minPlayers: 4, countAs: { good: 'bread', multiplier: 2 } },
            { name: 'pumpernickel bread', type: 'royal', value: 9, minPlayers: 4, countAs: { good: 'bread', multiplier: 3 } },
            { name: 'royal rooster', type: 'royal', value: 8, minPlayers: 4, countAs: { good: 'chickens', multiplier: 2 } },
        ];
        this.activePlayerCount = 4;
        this.players = [];
        this.activePlayerId = 'player1';
        this.initializePlayers(this.activePlayerCount);
        this.initializeEventListeners();
        this.initializeHistoryButton();
    }
    initializeHistoryButton() {
        const playerSelector = document.getElementById('player-selector');
        if (playerSelector) {
            const historyButton = document.createElement('button');
            historyButton.classList.add('history-button');
            historyButton.innerHTML = '📜 Games';
            historyButton.addEventListener('click', () => {
                historyButton.classList.remove('active');
                this.showGameHistory();
            });
            playerSelector.appendChild(historyButton);
        }
    }
    saveGame() {
        try {
            const gameId = crypto.randomUUID();
            const newGame = {
                id: gameId,
                date: new Date().toISOString(),
                players: this.players,
                activePlayerCount: this.activePlayerCount,
            };
            // Get existing games or initialize empty array
            const savedGames = JSON.parse(localStorage.getItem('sheriffGameHistory') || '[]');
            // Add new game to history
            savedGames.push(newGame);
            // Save updated history
            localStorage.setItem('sheriffGameHistory', JSON.stringify(savedGames));
            const saveConfirm = document.createElement('div');
            saveConfirm.className = 'save-confirmation';
            saveConfirm.textContent = '✅ Game saved to history!';
            document.body.appendChild(saveConfirm);
            setTimeout(() => saveConfirm.remove(), 2000);
        }
        catch (error) {
            console.error('Failed to save game:', error);
            alert('Failed to save game. Please try again.');
        }
    }
    loadGame(gameId) {
        try {
            const savedGames = JSON.parse(localStorage.getItem('sheriffGameHistory') || '[]');
            const gameToLoad = savedGames.find(game => game.id === gameId);
            if (gameToLoad) {
                this.players = gameToLoad.players;
                this.activePlayerCount = gameToLoad.activePlayerCount;
                this.activePlayerId = this.players[0].id;
                this.updateUI();
                this.updatePlayerSelectorUI(this.activePlayerCount);
                this.hideGameHistory();
            }
        }
        catch (error) {
            console.error('Failed to load game:', error);
            alert('Failed to load game. Please try again.');
        }
    }
    showGameHistory() {
        var _a;
        const savedGames = JSON.parse(localStorage.getItem('sheriffGameHistory') || '[]');
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'history-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'history-modal-content';
        // Add header
        const header = document.createElement('div');
        header.className = 'history-header';
        header.innerHTML = `
                <h2>Game History</h2>
                <div class="history-actions">
                    <button class="clear-save" onclick="window.game.clearSavedGame()">Clear All Games</button>
                    <button class="close-history">&times;</button>
                </div>
            `;
        modalContent.appendChild(header);
        // Add games list
        const gamesList = document.createElement('div');
        gamesList.className = 'games-list';
        if (savedGames.length === 0) {
            gamesList.innerHTML = '<p class="no-games">No saved games found</p>';
        }
        else {
            savedGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.className = 'game-card';
                const date = new Date(game.date);
                const formattedDate = new Intl.DateTimeFormat('en-US', {
                    // @ts-ignore
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }).format(date);
                const winningPlayer = this.getWinningPlayer(game.players);
                gameCard.innerHTML = `
                        <div class="game-info">
                            <div class="game-date">${formattedDate}</div>
                            <div class="player-count">${game.activePlayerCount} Players</div>
                            <div class="winner">Winner: ${winningPlayer.name}</div>
                            <div class="players-list">
                                Players: ${game.players.map(p => `${p.name} (${this.calculatePlayerTotalScore(p.id)})`).join(', ')}
                            </div>
                        </div>
                        <div class="game-actions">
                            <button class="load-game" data-game-id="${game.id}">Load Game</button>
                            <button class="delete-game" data-game-id="${game.id}">Delete</button>
                        </div>
                    `;
                gamesList.appendChild(gameCard);
            });
        }
        modalContent.appendChild(gamesList);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // Add event listeners
        (_a = modal.querySelector('.close-history')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.hideGameHistory());
        modal.querySelectorAll('.load-game').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = e.target.dataset.gameId;
                if (gameId)
                    this.loadGame(gameId);
            });
        });
        modal.querySelectorAll('.delete-game').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = e.target.dataset.gameId;
                if (gameId)
                    this.deleteGame(gameId);
            });
        });
    }
    hideGameHistory() {
        const modal = document.querySelector('.history-modal');
        if (modal)
            modal.remove();
    }
    deleteGame(gameId) {
        try {
            const savedGames = JSON.parse(localStorage.getItem('sheriffGameHistory') || '[]');
            const updatedGames = savedGames.filter(game => game.id !== gameId);
            localStorage.setItem('sheriffGameHistory', JSON.stringify(updatedGames));
            this.showGameHistory(); // Refresh the history view
        }
        catch (error) {
            console.error('Failed to delete game:', error);
            alert('Failed to delete game. Please try again.');
        }
    }
    getWinningPlayer(players) {
        return players.reduce((winner, player) => this.calculatePlayerTotalScore(player.id) > this.calculatePlayerTotalScore(winner.id) ? player : winner, players[0]);
    }
    getAvailableGoods() {
        return this.goods.filter(good => !good.minPlayers || good.minPlayers <= this.activePlayerCount);
    }
    initializePlayers(count) {
        this.activePlayerCount = count;
        const availableGoods = this.getAvailableGoods();
        this.players = Array.from({ length: count }, (_, i) => ({
            id: `player${i + 1}`,
            name: `Player ${i + 1}`,
            scores: availableGoods.reduce((acc, good) => (Object.assign(Object.assign({}, acc), { [good.name]: 0 })), {}),
            coins: 0
        }));
        this.activePlayerId = 'player1';
        this.updateUI();
    }
    initializeEventListeners() {
        var _a, _b;
        // Player count buttons
        document.querySelectorAll('#player-selector button').forEach(button => {
            if (button.classList.contains('history-button'))
                return;
            button.addEventListener('click', (e) => {
                const target = e.target;
                const playerCount = parseInt(target.dataset.value || '4');
                this.initializePlayers(playerCount);
                this.updatePlayerSelectorUI(playerCount);
            });
        });
        // Tab selection delegation
        (_a = document.getElementById('tabs')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
            const target = e.target;
            const tabButton = target.closest('.tab-button');
            if (tabButton) {
                if (tabButton.classList.contains('totals-tab')) {
                    this.activePlayerId = null; // No player is active when showing totals
                    document.getElementById('tab-content').innerHTML = this.getTotalsHTML();
                }
                else {
                    const playerId = tabButton.getAttribute('data-player');
                    if (playerId) {
                        this.activePlayerId = playerId;
                        document.getElementById('tab-content').innerHTML = this.getPlayerTabHTML(playerId);
                    }
                }
                this.updateTabsUI();
            }
        });
        // Name editing delegation
        (_b = document.getElementById('tab-content')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-name-btn')) {
                const playerId = target.getAttribute('data-player');
                if (playerId) {
                    this.startEditingName(playerId);
                }
            }
        });
    }
    startEditingName(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return;
        const newName = prompt('Enter new name:', player.name);
        if (newName !== null && newName.trim() !== '') {
            player.name = newName.trim();
            this.updateUI();
        }
    }
    updatePlayerSelectorUI(activeCount) {
        document.querySelectorAll('#player-selector button').forEach(button => {
            if (button.classList.contains('history-button')) {
                button.classList.remove('active'); // Ensure history button is never active
                return;
            }
            const count = parseInt(button.dataset.value || '4');
            button.classList.toggle('active', count === activeCount);
        });
    }
    getTabsHTML() {
        const playerTabs = this.players
            .map((player) => `
                <button class="tab-button ${this.activePlayerId === player.id ? 'active' : ''}" 
                        data-player="${player.id}">
                    ${player.name}
                    <span class="score-total">${this.calculateTotal(player.id)}</span>
                </button>
            `).join('');
        return `
            <div class="tabs-container">
                ${playerTabs}
                <button class="tab-button totals-tab ${this.activePlayerId === null ? 'active' : ''}">
                    Totals
                </button>
            </div>
        `;
    }
    updateTabsUI() {
        const tabsContainer = document.getElementById('tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = this.getTabsHTML();
        }
    }
    getPlayerTabHTML(playerId) {
        const player = this.players.find((p) => p.id === playerId);
        if (!player)
            return `<p>Player not found.</p>`;
        const availableGoods = this.getAvailableGoods();
        return `
            <div class="player-score-card">
                <div class="player-header">
                    <h2>${player.name}</h2>
                    <button class="edit-name-btn" data-player="${player.id}">
                        ✏️ Edit
                    </button>
                </div>
                <div class="score-row">
                    <label class="score-label">
                        <span class="good-name">Coins</span>
                    </label>
                    <div class="score-input-group">
                        <button class="score-adjust" 
                                onclick="window.game.adjustCoins('${player.id}', -1)">-</button>
                        <input type="number" 
                               class="score-input"
                               value="${player.coins}"
                               onchange="window.game.updateCoins('${player.id}', this.value)" />
                        <button class="score-adjust"
                                onclick="window.game.adjustCoins('${player.id}', 1)">+</button>
                    </div>
                </div>
                <h3>Regular Goods</h3>
                ${availableGoods
            .filter(good => good.type === 'regular')
            .map(good => this.createGoodRow(player, good))
            .join('')}
                
                <h3>Contraband</h3>
                ${availableGoods
            .filter(good => good.type === 'contraband')
            .map(good => this.createGoodRow(player, good))
            .join('')}
                
                <h3>Royal Goods</h3>
                ${availableGoods
            .filter(good => good.type === 'royal')
            .map(good => this.createGoodRow(player, good))
            .join('')}

                <div class="player-total">
                    Total Score: ${this.calculatePlayerTotalScore(player.id)}
                </div>
            </div>
        `;
    }
    createGoodRow(player, good) {
        const isKing = this.isKingOfItem(player.id, good.name);
        const isQueen = this.isQueenOfItem(player.id, good.name);
        const countInfo = good.countAs ? ` (counts as ${good.countAs.multiplier} ${good.countAs.good})` : '';
        return `
            <div class="score-row ${isKing ? 'is-king' : ''}">
                <label class="score-label">
                    <span class="good-name">${good.name} (${good.value} coins${countInfo}${good.kingBonus ? `, King: +${good.kingBonus}` : ''}${good.queenBonus ? `, Queen: +${good.queenBonus}` : ''})</span>
                    ${isKing ? '<span class="crown">🥇</span>' : ''}
                    ${isQueen ? '<span class="crown">🥈</span>' : ''}
                </label>
                <div class="score-input-group">
                    <button class="score-adjust" 
                            onclick="window.game.adjustScore('${player.id}', '${good.name}', -1)">-</button>
                    <input type="number" 
                           class="score-input"
                           value="${player.scores[good.name]}"
                           onchange="window.game.updateScore('${player.id}', '${good.name}', this.value)" />
                    <button class="score-adjust"
                            onclick="window.game.adjustScore('${player.id}', '${good.name}', 1)">+</button>
                </div>
            </div>
        `;
    }
    getTotalsHTML() {
        const playerTotals = this.players.map(player => {
            const goodScores = this.goods.map(good => {
                const count = player.scores[good.name] || 0;
                const value = count * good.value;
                const kingBonus = this.isKingOfItem(player.id, good.name) ? (good.kingBonus || 0) : 0;
                const queenBonus = this.isQueenOfItem(player.id, good.name) ? (good.queenBonus || 0) : 0;
                return {
                    name: good.name,
                    count,
                    value,
                    kingBonus,
                    queenBonus
                };
            });
            const totalGoodsValue = goodScores.reduce((sum, score) => sum + score.value, 0);
            const totalKingBonus = goodScores.reduce((sum, score) => sum + score.kingBonus, 0);
            const totalQueenBonus = goodScores.reduce((sum, score) => sum + score.queenBonus, 0);
            const totalWithCoins = totalGoodsValue + totalKingBonus + totalQueenBonus + player.coins;
            return {
                player,
                goodScores,
                totalGoodsValue,
                totalKingBonus,
                totalQueenBonus,
                totalWithCoins
            };
        });
        // Sort players by total score
        playerTotals.sort((a, b) => b.totalWithCoins - a.totalWithCoins);
        const winner = playerTotals[0];
        return `
            <div class="totals-card">
                <h2>Game Totals</h2>
                <table class="totals-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Goods Value</th>
                            <th>King Bonuses</th>
                            <th>Queen Bonuses</th>
                            <th>Coins</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${playerTotals.map(pt => `
                            <tr class="${pt === winner ? 'winner-row' : ''}">
                                <td>${pt.player.name}</td>
                                <td>${pt.totalGoodsValue}</td>
                                <td>${pt.totalKingBonus}</td>
                                <td>${pt.totalQueenBonus}</td>
                                <td>${pt.player.coins}</td>
                                <td><strong>${pt.totalWithCoins}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="winner-announcement">
                    🎉 ${winner.player.name} wins with ${winner.totalWithCoins} coins! 🎉
                </div>

                <div class="detailed-scores">
                    <h3>Detailed Breakdown</h3>
                    ${this.goods.map(good => {
            const kings = this.getKingsOfItem(good.name);
            const queen = this.getQueenOfItem(good.name);
            return `
                            <div class="good-breakdown">
                                <h4>${good.name} (${good.value} coins)</h4>
                                ${kings.length > 0 ? `
                                    <div class="kings-list">
                                        King${kings.length > 1 ? 's' : ''}: ${kings.map(p => p.name).join(', ')}
                                        ${good.kingBonus ? ` (+${good.kingBonus} coins)` : ''}
                                    </div>
                                ` : ''}
                                ${queen ? `
                                    <div class="queen-list">
                                        Queen: ${queen.name}
                                        ${good.queenBonus ? ` (+${good.queenBonus} coins)` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }
    calculatePlayerTotalScore(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return 0;
        const goodsValue = this.goods.reduce((total, good) => {
            const count = player.scores[good.name] || 0;
            const value = count * good.value;
            const kingBonus = this.isKingOfItem(playerId, good.name) ? (good.kingBonus || 0) : 0;
            return total + value + kingBonus;
        }, 0);
        return goodsValue + player.coins;
    }
    updateScore(playerId, item, value) {
        const player = this.players.find((p) => p.id === playerId);
        if (player) {
            player.scores[item] = Math.max(0, parseInt(value) || 0);
            this.updateUI();
        }
    }
    updateCoins(playerId, value) {
        const player = this.players.find((p) => p.id === playerId);
        if (player) {
            player.coins = Math.max(0, parseInt(value) || 0);
            this.updateUI();
        }
    }
    adjustCoins(playerId, delta) {
        const player = this.players.find((p) => p.id === playerId);
        if (player) {
            player.coins = Math.max(0, player.coins + delta);
            this.updateUI();
        }
    }
    adjustScore(playerId, item, delta) {
        const player = this.players.find((p) => p.id === playerId);
        if (player) {
            player.scores[item] = Math.max(0, (player.scores[item] || 0) + delta);
            this.updateUI();
        }
    }
    calculateTotal(playerId) {
        const player = this.players.find((p) => p.id === playerId);
        return player ? Object.values(player.scores).reduce((a, b) => a + b, 0) : 0;
    }
    calculateGrandTotal() {
        return this.players.reduce((sum, player) => sum + this.calculateTotal(player.id), 0);
    }
    getEffectiveGoodCount(playerId, goodType) {
        const player = this.players.find(p => p.id === playerId);
        if (!player)
            return 0;
        let count = player.scores[goodType] || 0;
        this.goods
            .filter(good => { var _a; return good.type === 'royal' && ((_a = good.countAs) === null || _a === void 0 ? void 0 : _a.good) === goodType; })
            .forEach(royalGood => {
            var _a;
            const royalCount = player.scores[royalGood.name] || 0;
            count += royalCount * (((_a = royalGood.countAs) === null || _a === void 0 ? void 0 : _a.multiplier) || 1);
        });
        return count;
    }
    isKingOfItem(playerId, item) {
        const kings = this.getKingsOfItem(item);
        return kings.some(p => p.id === playerId);
    }
    isQueenOfItem(playerId, item) {
        const queen = this.getQueenOfItem(item);
        return (queen === null || queen === void 0 ? void 0 : queen.id) === playerId;
    }
    getQueenOfItem(item) {
        const playersWithItem = this.players.filter(player => this.getEffectiveGoodCount(player.id, item) > 0);
        if (playersWithItem.length < 2)
            return undefined;
        const sortedPlayers = playersWithItem.sort((a, b) => this.getEffectiveGoodCount(b.id, item) - this.getEffectiveGoodCount(a.id, item));
        const highestScore = this.getEffectiveGoodCount(sortedPlayers[0].id, item);
        return sortedPlayers.find(player => this.getEffectiveGoodCount(player.id, item) < highestScore);
    }
    getKingsOfItem(item) {
        const maxScore = Math.max(...this.players.map(p => this.getEffectiveGoodCount(p.id, item)));
        return maxScore > 0 ?
            this.players.filter(p => this.getEffectiveGoodCount(p.id, item) === maxScore)
            : [];
    }
    updateUI() {
        this.updateTabsUI();
        // Update current tab content if needed
        const tabContent = document.getElementById('tab-content');
        if (tabContent) {
            if (this.activePlayerId === null) {
                tabContent.innerHTML = this.getTotalsHTML();
            }
            else {
                tabContent.innerHTML = this.getPlayerTabHTML(this.activePlayerId);
            }
        }
    }
    isValidGameState(state) {
        // Basic structure validation
        if (!state || typeof state !== 'object')
            return false;
        if (!Array.isArray(state.players))
            return false;
        if (typeof state.activePlayerCount !== 'number')
            return false;
        if (typeof state.activePlayerId !== 'string')
            return false;
        // Validate each player
        return state.players.every((player) => player &&
            typeof player.id === 'string' &&
            typeof player.name === 'string' &&
            typeof player.scores === 'object' &&
            typeof player.coins === 'number');
    }
    clearSavedGame() {
        try {
            localStorage.removeItem('sheriffGame');
            alert('Saved game cleared successfully');
        }
        catch (error) {
            console.error('Failed to clear saved game:', error);
            alert('Failed to clear saved game');
        }
    }
}
// Initialize the game
const game = new Game();
window.game = game;
// Load saved game if exists
