const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get Pi system resources
async function getPiResources() {
    try {
        // CPU usage
        const { stdout: cpuInfo } = await execPromise("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1");
        const cpuUsage = parseFloat(cpuInfo.trim()) || 0;
        
        // Memory usage
        const { stdout: memInfo } = await execPromise("free | grep Mem | awk '{print ($3/$2) * 100.0}'");
        const memUsage = parseFloat(memInfo.trim()) || 0;
        
        // Disk usage
        const { stdout: diskInfo } = await execPromise("df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1");
        const diskUsage = parseFloat(diskInfo.trim()) || 0;
        
        // Temperature
        let tempCelsius = 0;
        try {
            const { stdout: tempInfo } = await execPromise("vcgencmd measure_temp | cut -d'=' -f2 | cut -d\"'\" -f1");
            tempCelsius = parseFloat(tempInfo.trim()) || 0;
        } catch (err) {
            // Fallback for non-Pi systems
            try {
                const { stdout: tempInfo } = await execPromise("cat /sys/class/thermal/thermal_zone0/temp");
                tempCelsius = parseFloat(tempInfo.trim()) / 1000 || 0;
            } catch {}
        }
        
        return {
            cpu: Math.round(cpuUsage * 10) / 10,
            memory: Math.round(memUsage * 10) / 10,
            disk: Math.round(diskUsage * 10) / 10,
            temperature: Math.round(tempCelsius * 10) / 10
        };
    } catch (error) {
        console.error('Error getting Pi resources:', error);
        return { cpu: 0, memory: 0, disk: 0, temperature: 0 };
    }
}

// Check if a process is running
async function checkProcessStatus(processName) {
    try {
        const { stdout } = await execPromise(`ps aux | grep -i "${processName}" | grep -v grep`);
        if (stdout.trim()) {
            // Extract memory usage (in MB)
            const lines = stdout.trim().split('\n');
            const memory = lines.reduce((sum, line) => {
                const parts = line.trim().split(/\s+/);
                return sum + (parseFloat(parts[5]) / 1024 || 0);
            }, 0);
            
            // Try to get uptime from ps
            const parts = stdout.trim().split(/\s+/);
            const uptime = parts[9] || '--';
            
            return {
                running: true,
                memory: Math.round(memory * 10) / 10,
                uptime: uptime,
                status: 'online'
            };
        }
        return { running: false, memory: 0, uptime: '--', status: 'offline' };
    } catch (error) {
        return { running: false, memory: 0, uptime: '--', status: 'offline' };
    }
}

// Get bot status
app.get('/api/status', async (req, res) => {
    try {
        const [rustppStatus, rconStatus, ratsStatus, piResources] = await Promise.all([
            checkProcessStatus('rust'),  // Adjust process name as needed
            checkProcessStatus('rcon'),  // Adjust process name as needed
            checkProcessStatus('node.*RATS'),  // RATS-DiscordBot (Node.js process)
            getPiResources()
        ]);
        
        res.json({
            bots: {
                rustpp: rustppStatus,
                rcon: rconStatus,
                rats: ratsStatus
            },
            pi: piResources,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// Get console history
app.get('/api/console/:bot', async (req, res) => {
    const { bot } = req.params;
    
    try {
        let lines = [];
        let logPath = '';
        
        // Determine log file path based on bot
        switch(bot) {
            case 'rustpp':
                // Check common log locations for RUST++ bot
                logPath = '/home/mtvproof/.pm2/logs/rustpp-out.log'; // Adjust as needed
                break;
            case 'rcon':
                logPath = '/home/mtvproof/.pm2/logs/rcon-out.log'; // Adjust as needed
                break;
            case 'rats':
                logPath = '/home/mtvproof/.pm2/logs/RATS-out.log'; // Adjust as needed
                break;
        }
        
        // Try to read actual log file
        if (logPath) {
            try {
                const { stdout } = await execPromise(`tail -n 50 "${logPath}" 2>/dev/null || echo ""`);
                if (stdout.trim()) {
                    lines = stdout.trim().split('\n').slice(-30); // Last 30 lines
                }
            } catch (err) {
                // If log file doesn't exist, show default message
            }
        }
        
        // If no logs found, show default message
        if (lines.length === 0) {
            lines = [
                `Console initialized for ${bot}`,
                `Waiting for log data...`,
                `Log path: ${logPath || 'Not configured'}`
            ];
        }
        
        res.json({
            bot: bot,
            lines: lines
        });
    } catch (error) {
        console.error('Console error:', error);
        res.json({
            bot: bot,
            lines: [
                `Error loading console logs`,
                `Check log file path configuration`
            ]
        });
    }
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
