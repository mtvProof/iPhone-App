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
        const [rustppStatus, rconStatus, piResources] = await Promise.all([
            checkProcessStatus('rust'),  // Adjust process name as needed
            checkProcessStatus('rcon'),  // Adjust process name as needed
            getPiResources()
        ]);
        
        res.json({
            bots: {
                rustpp: rustppStatus,
                rcon: rconStatus
            },
            pi: piResources,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// Execute RCON command (you'll need to integrate with your actual RCON implementation)
app.post('/api/rcon', async (req, res) => {
    const { bot, command } = req.body;
    
    try {
        // This is a placeholder - integrate with your actual RCON bot
        // You might want to send commands to your Discord bot or directly to the game server
        
        // Example: Forward to your RATS-DiscordBot if it has an API
        // Or execute RCON command directly if you have credentials
        
        res.json({
            success: true,
            output: `Command sent to ${bot}: ${command}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('RCON error:', error);
        res.status(500).json({ error: 'Failed to execute RCON command' });
    }
});

// Get console history (mock data for now)
app.get('/api/console/:bot', (req, res) => {
    const { bot } = req.params;
    
    // This should be replaced with actual console log reading
    res.json({
        bot: bot,
        lines: [
            `[${new Date().toLocaleTimeString()}] Console initialized for ${bot}`,
            `[${new Date().toLocaleTimeString()}] Type commands below...`
        ]
    });
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
