const { ActivityType, Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const samp = require('samp-query');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Buat instance client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'src/commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.error(`Command ${file} tidak memiliki data yang valid.`);
    }
}

// Server SAMP details
const SERVER_IP = '159.223.67.162';  // Ganti dengan IP server SAMP Anda
const SERVER_PORT = 7004;  // Ganti dengan port server SAMP Anda

// Fungsi untuk mengambil status server SAMP
function getSampStatus() {
    return new Promise((resolve, reject) => {
        const options = {
            host: SERVER_IP,
            port: SERVER_PORT
        };

        samp(options, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN); // Mengambil token dari .env
// Deploy slash commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Mengambil client ID dari .env
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', async () => {
    console.log(`${client.user.tag} is now online.`);

    // Fungsi untuk memperbarui status bot berdasarkan jumlah pemain di server SAMP
    const updateActivity = async () => {
        try {
            const serverStatus = await getSampStatus();
            // Set status bot dengan jumlah pemain yang online dan maksimal
            // / ${serverStatus.maxplayers || 700}
            client.user.setPresence({
                activities: [{ name: `📊 ${serverStatus.online || 0} players | CLVR Project`, type: ActivityType.Playing }],
                status: 'idle',
            });
        } catch (error) {
            console.error('Error fetching SAMP status:', error);
            // Jika ada error, set status bot menjadi offline
            client.user.setPresence({
                activities: [{ name: 'Server offline', type: ActivityType.Playing }],
                status: 'idle',
            });
        }
    };

    // Update status bot setiap 60 detik
    setInterval(updateActivity, 60000); // 1 menit
    await updateActivity(); // Jalankan sekali saat bot ready
});

// Event handler untuk command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login bot dan deploy command
client.login(process.env.DISCORD_TOKEN)
