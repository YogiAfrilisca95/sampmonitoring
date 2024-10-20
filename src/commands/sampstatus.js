const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const samp = require('samp-query');

const SERVER_IP = '157.254.166.204';  // Ganti dengan IP server SAMP Anda
const SERVER_PORT = 7777;  // Ganti dengan port server SAMP Anda

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sampstatus')
        .setDescription('Menampilkan status server SAMP'),

    async execute(interaction) {
        const options = {
            host: SERVER_IP,
            port: SERVER_PORT
        };

        // Mengambil status server SAMP
        samp(options, (error, serverStatus) => {
            if (error) {
                interaction.reply('Gagal mengambil status server SAMP.');
                console.error('Error:', error);
                return;
            }

            // Cek data yang dikembalikan oleh server untuk debugging
            // console.log(serverStatus);

            // Buat embed untuk status server
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('SAMP Server Status')
                .addFields(
                    { name: 'Hostname', value: serverStatus.hostname, inline: true },
                    { name: 'Map', value: serverStatus.mapname, inline: true },
                    { name: 'Mode', value: serverStatus.gamemode, inline: true },
                    { name: 'Players', value: `${serverStatus.online || 0} / ${serverStatus.maxplayers || 700}`, inline: true } // Tambahkan fallback jika data tidak ada
                )
                .setTimestamp();

            // Kirim embed ke channel
            interaction.reply({ embeds: [embed] });
        });
    }
};
