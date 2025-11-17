// Monitoring Dashboard JavaScript

// Configuration
// When testing locally on same network, use Pi IP
// When deployed, you'll need to expose this via port forwarding or use same network
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001/api'
    : 'http://192.168.0.16:3001/api';
const UPDATE_INTERVAL = 5000; // Update every 5 seconds

let currentBot = 'rustpp';
let updateTimer = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    startMonitoring();
});

function initializeDashboard() {
    // Add initial console message
    addConsoleOutput('System', 'Dashboard initialized. Connecting to server...');
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentBot = this.dataset.bot;
            clearConsole();
            loadConsoleHistory(currentBot);
        });
    });
    
    // Send command
    const sendButton = document.getElementById('send-command');
    const consoleInput = document.getElementById('console-input');
    
    sendButton.addEventListener('click', () => sendCommand());
    consoleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendCommand();
    });
}

function startMonitoring() {
    updateStatus();
    updateTimer = setInterval(updateStatus, UPDATE_INTERVAL);
}

function stopMonitoring() {
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
}

// Update all status information
async function updateStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const data = await response.json();
        
        // Update bot statuses
        updateBotStatus('rustpp', data.bots.rustpp);
        updateBotStatus('rcon', data.bots.rcon);
        
        // Update Pi resources
        updatePiResources(data.pi);
        
        // Clear any previous error messages
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput && consoleOutput.children.length === 0) {
            addConsoleOutput('system', `Connected to API server at ${API_URL}`);
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        addConsoleOutput('error', `Connection failed: ${error.message}`);
        addConsoleOutput('warning', 'Make sure you are on the same network as your Pi');
        addConsoleOutput('warning', 'API URL: ' + API_URL);
        handleOfflineState();
    }
}

// Update bot status display
function updateBotStatus(botName, status) {
    const statusIndicator = document.getElementById(`${botName}-status`);
    const uptimeElement = document.getElementById(`${botName}-uptime`);
    const memoryElement = document.getElementById(`${botName}-memory`);
    const stateElement = document.getElementById(`${botName}-state`);
    
    if (status.running) {
        statusIndicator.className = 'status-indicator online';
        uptimeElement.textContent = status.uptime;
        memoryElement.textContent = `${status.memory} MB`;
        stateElement.textContent = 'Running';
        stateElement.style.color = '#34C759';
    } else {
        statusIndicator.className = 'status-indicator offline';
        uptimeElement.textContent = '--';
        memoryElement.textContent = '--';
        stateElement.textContent = 'Offline';
        stateElement.style.color = '#FF3B30';
    }
}

// Update Pi resource displays
function updatePiResources(resources) {
    // CPU
    updateResourceBar('cpu', resources.cpu);
    document.getElementById('cpu-value').textContent = `${resources.cpu}%`;
    
    // Memory
    updateResourceBar('memory', resources.memory);
    document.getElementById('memory-value').textContent = `${resources.memory}%`;
    
    // Disk
    updateResourceBar('disk', resources.disk);
    document.getElementById('disk-value').textContent = `${resources.disk}%`;
    
    // Temperature
    const tempPercent = Math.min((resources.temperature / 80) * 100, 100);
    updateResourceBar('temp', tempPercent);
    document.getElementById('temp-value').textContent = `${resources.temperature}°C`;
}

function updateResourceBar(id, percentage) {
    const bar = document.getElementById(`${id}-bar`);
    bar.style.width = `${percentage}%`;
    
    // Change color based on usage
    bar.className = 'progress-fill';
    if (percentage > 80) {
        bar.classList.add('high');
    } else if (percentage > 60) {
        bar.classList.add('medium');
    }
}

// Console functions
function addConsoleOutput(type, message) {
    const consoleOutput = document.getElementById('console-output');
    const line = document.createElement('div');
    line.className = `console-line ${type.toLowerCase()}`;
    
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${message}`;
    
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    document.getElementById('console-output').innerHTML = '';
}

async function loadConsoleHistory(bot) {
    try {
        const response = await fetch(`${API_URL}/console/${bot}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        data.lines.forEach(line => {
            addConsoleOutput('system', line);
        });
    } catch (error) {
        addConsoleOutput('error', `Failed to load console: ${error.message}`);
        addConsoleOutput('warning', 'Check that API server is running and accessible');
        addConsoleOutput('system', `Trying to connect to: ${API_URL}`);
    }
}

async function sendCommand() {
    const input = document.getElementById('console-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    // Display command in console
    addConsoleOutput('command', `> ${command}`);
    input.value = '';
    
    try {
        const response = await fetch(`${API_URL}/rcon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bot: currentBot,
                command: command
            })
        });
        
        if (!response.ok) throw new Error('Command failed');
        
        const data = await response.json();
        addConsoleOutput('system', data.output);
        
    } catch (error) {
        addConsoleOutput('error', `Error: ${error.message}`);
    }
}

function handleOfflineState() {
    // Update all indicators to offline
    document.querySelectorAll('.status-indicator').forEach(indicator => {
        indicator.className = 'status-indicator offline';
    });
    
    // Show connection error in console if visible
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput && consoleOutput.children.length === 0) {
        addConsoleOutput('error', 'Cannot connect to API server. Please check if the backend is running.');
    }
}

// Handle page visibility change to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopMonitoring();
    } else {
        startMonitoring();
    }
});
