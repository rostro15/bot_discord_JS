const Discord = require("discord.js");
const fs = require('fs');

class Help{
	constructor(client, interaction){

		this.component = [{
			"type": 1,
			"components":[{
					"type": 2,
					"style": 1,
					"label": "commandes",
					"custom_id": "help_index"
				},{
					"type": 2,
					"style": 1,
					"label": "admin",
					"custom_id": "help_admin"
				},{
					"type": 2,
					"style": 5,
					"label": "site web (y a r)",
					"url":"http://rostro15.fr/"
				}
			]
		}, {
				"type": 1,
				"components": [
					{
						"type": 3,
						"custom_id": "class_select_1",
						"options":[
							{
								"label": "Rogue",
								"value": "rogue",
								"description": "Sneak n stab",
								"emoji": {
									"name": "rogue",
									"id": "625891304148303894"
								}
							},
							{
								"label": "Mage",
								"value": "mage",
								"description": "Turn 'em into a sheep",
								"emoji": {
									"name": "mage",
									"id": "625891304081063986"
								}
							},
							{
								"label": "Priest",
								"value": "priest",
								"description": "You get heals when I'm done doing damage",
								"emoji": {
									"name": "priest",
									"id": "625891303795982337"
								}
							}
						],
						"placeholder": "Choose a class",
						"min_values": 1,
						"max_values": 3
					}
				]
			}]

		this.client = client;
		this.em = this.client.myem;

		this.id = interaction.id

		var embed = new Discord.EmbedBuilder()
		.setTitle("Commande du bot")
		.setAuthor({name: this.client.user.username, iconURL : this.client.user.avatarURL()})
		.addFields(
			{ name: '/call message max', value: 'cree un appel, 👍 pour vous inscrire, 👎 pour vous désinscrire, 📯 pour faire l\'appel, ❌ pour effacer le message '},
			{ name: '/game jeu', value: 'crée une partie d\'un jeu intégré discord'},
		)
	
		interaction.reply({ephemeral:true, embeds:[embed], components:this.component  });

		this.open_listeners();
		this.close()
	}

	open_listeners(){

		var help = this;
		this.em.on(this.id, async function (interaction) {
			var command = interaction.customId;
			switch(command){
				case "help_index":
					help.index(interaction);
				break;
				case "help_admin":
					help.admin(interaction);				

				break;
			}
		})
	}

	async close(){
		await sleep(1200000);
		this.em.removeAllListeners(this.messID);
		delete this;
		
		  
		function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
		}
	}

	index(interaction){
		var embed = new Discord.EmbedBuilder()
		.setTitle("Commande du bot")
		.setAuthor({name: this.client.user.username, iconURL : this.client.user.avatarURL()})
		.addFields(
			{ name: '/call message max', value: 'cree un appel, 👍 pour vous inscrire, 👎 pour vous désinscrire, 📯 pour faire l\'appel, ❌ pour effacer le message '},
			{ name: '/game jeu', value: 'crée une partie d\'un jeu intégré discord'},
		)

		interaction.update({ephemeral:true, embeds:[embed], components:this.component  });
	}

	admin(interaction){
		var embed = new Discord.EmbedBuilder()
		.setTitle("Commande du bot : admin")
		.setAuthor({name: this.client.user.username, iconURL : this.client.user.avatarURL()})
		.addFields(
			{ name: '/modifycall add/del call_messageID @user', value: 'ajoute au suprime un utilisateur du call'},
		)

		interaction.update({ephemeral:true, embeds:[embed], components:this.component  });
	}

	gif(interaction){
		var embed = new Discord.EmbedBuilder()
		.setTitle("Commande du bot")
		.setAuthor({name: this.client.user.username, iconURL : this.client.user.avatarURL()})

		var rawdata = fs.readFileSync("guild_sto/"+interaction.guild.id+'.json');
		var sto = JSON.parse(rawdata);
	
		for(var key in sto.gif) {
			var value = sto.gif[key];
			embed.addFields({ name: key, value: value})
		}

	
		

		interaction.update({ephemeral:true, embeds:[embed], components:this.component  });
	}


}

module.exports = Help;