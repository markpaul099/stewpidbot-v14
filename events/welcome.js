const { AttachmentBuilder, Events } = require("discord.js");
const Canvas = require("canvas");

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member) {
		if (member.client.guilds.cache.get(member.guild.id)) {
			// Ignore Bot
			if (member.user.bot) return;
			// Ignore test account
			if (member.user.id == "645470684419719170") return;

			// Auto Add Role
			const role = member.guild.roles.cache.find(role => role.name === "member");
			member.roles.add(role);

			// Welcome Message (Image)
			const welcomeChannel = await member.guild.channels.cache.find(channel => channel.name === "welcome");

			const invite = await welcomeChannel.createInvite();

			const memberCount = member.guild.members.cache.filter(member => !member.user.bot).size;

			const applyText = (canvas, text) => {
				const context = canvas.getContext("2d");
				let fontSize = 70;

				do {
					context.font = `${fontSize -= 10}px sans-serif`;
				} while (context.measureText(text).width > canvas.width - 300);

				return context.font;
			};

			const canvas = Canvas.createCanvas(700, 250);
			const context = canvas.getContext("2d");

			const background = await Canvas.loadImage("https://i.ibb.co/c69rDyd/welcome-700px-text-overlay.jpg");
			context.drawImage(background, 0, 0, 700, 250);

			context.strokeStyle = "#74037b";
			context.strokeRect(0, 0, canvas.width, canvas.height);

			context.font = applyText(canvas, `${member.displayName}!`);
			context.fillStyle = "#ffffff";
			context.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 2.5);

			context.font = "30px sans-serif";
			context.fillStyle = "#ffffff";
			context.fillText("Just joined the server", canvas.width / 2.5, canvas.height / 1.7);

			context.font = "30px sans-serif";
			context.fillStyle = "#ffffff";
			context.fillText(`Member #${memberCount}`, canvas.width / 2.5, canvas.height / 1.3);

			context.beginPath();
			context.arc(125, 125, 100, 0, Math.PI * 2, true);
			context.closePath();
			context.clip();

			const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "png" }));
			context.drawImage(avatar, 25, 25, 200, 200);

			const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: `welcome-${member.displayName}.png` });
			welcomeChannel.send({ content: `Hey <@${member.user.id}> Welcome to **${member.guild.name}** :two_hearts:!!!\nInvite Link: ${invite}\nPlease change your Discord nickname to your in-game name :)`, files: [attachment] });
		}
	},
};
