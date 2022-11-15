const console = require("./Console").console
const Discord = require("discord.js");
const fs = require('fs');
const events = require('events');

const fetch = require('node-fetch');


console.info("Starting...");


const intro = [
'////////////////////////////////////////////////////////////////',
'///////////             BOT DISCORD v5.2             ///////////',
'///////////        un code propre et MAJ api         ///////////',
'///////////   author : Theo "rostro15" RUSINOWITCH   ///////////',
'///////////         discord : rostro15#9153          ///////////',
'///////////        mail : teo.rusi@hotmail.fr        ///////////',
'////////////////////////////////////////////////////////////////'
];

// importation des classe
const monClient = require("./Client.js");
const Call = require("./Call.js");
const Help = require("./Help.js");
const Media_api = require("./Media_api.js");

media_api = new Media_api()

const config = require("./config.json");
const client = new monClient();
const em = new events.EventEmitter();




var guilds = {}


client.on('ready', async () => {
	/*for(var key in intro) {
		console.verbose(intro[key]);
	}*/
	client.user.setActivity('/help', { type: 'WATCHING' })
	

	console.warn("🚀 I am ready!  📡 Connecter en tant que : "+client.user.tag+"\n");

	/*console.info("Liste des commandes :");
	await client.rest.get(Routes.applicationCommands(client.user.id))
    .then(result => {
		for(var key in result) {
			var value = result[key];
			console.info("/"+value.name);
		} 
	})*/

    //recrée les calls
	var rawdata = fs.readFileSync("call_sto/call_sto.json");
	var fileData = JSON.parse(rawdata);
	for(var key in fileData) {
		try {
			var value = fileData[key];
		new Call(client, value, key);
		} catch (error) {
			var rawdata = fs.readFileSync("call_sto/call_sto.json");
				var fileData = JSON.parse(rawdata);

				delete fileData[key];

				var data = JSON.stringify(fileData);
				fs.writeFileSync("call_sto/call_sto.json", data);
				console.error(error);
				console.warn("erreur dans la recup d'un call");
				return
		}
	}

	client.guilds.cache.each(guild => { //liste des guilds dans lequelles il y a le bot
		console.data(guild.name);
		guilds[guild.id] = guild
	})
	client.guilds_list = guilds

	


});

const modal_collector = new Discord.InteractionCollector(client, {interactionType:5})
modal_collector.on('collect', async (modal_interaction) => {
	client.create_call(em, modal_interaction);
})



client.on('interactionCreate', async interaction => {
	var command = "erreur";
	console.dir(`[interaction] id : ${interaction.customId} | type : ${interaction.type} | user : ${interaction.user.tag} | guild : ${interaction.guild.name} | channel : ${interaction.channel.name}`);
	

	if(interaction.customId == "create_call_button"){
		const modal = new Discord.ModalBuilder().setTitle("creation call").setCustomId("oskoyr");

		const modalTextInput = new Discord.TextInputBuilder().setCustomId("call_name").setLabel("Nom du call").setStyle(Discord.TextInputStyle.Short);
		const modalTextInput_max = new Discord.TextInputBuilder().setCustomId("call_max").setLabel("Nombre de place").setStyle(Discord.TextInputStyle.Short).setRequired(false).setValue("5");
	
	
		const rows = new Discord.ActionRowBuilder().addComponents(modalTextInput);
		modal.addComponents(rows)
	
		const rows_max = new Discord.ActionRowBuilder().addComponents(modalTextInput_max);
		modal.addComponents(rows_max)
	
		await interaction.showModal(modal);
		return;
	}
	switch(interaction.type){
		case 3: //commande issue des component
			if(!client.myem.emit(interaction.message.id, interaction)){
				
				if(interaction.message.interaction != null){
					if(!client.myem.emit(interaction.message.interaction.id, interaction)){
						interaction.deferUpdate()
					}
				}else{
					interaction.deferUpdate()
				}
				
			}
		break;
		case 2: //commande issue des commandes slash
			command = interaction.commandName.toLowerCase();
			const args = interaction.options;
			switch(command) {
				case "help":
					new Help(client,interaction)
				break;
				case "lol_stat":
					var user_name = args.get("user_name").value;
					
					const alias_rank = {
						BRONZE:8865323,
						CHALLENGER:16311770,
						DIAMOND:12186367,//"#e4b657"
						GOLD:15844367,
						GRANDMASTER:16533051,
						IRON:2759192,
						MASTER:14298091,
						PLATINUM:3897463,
						SILVER:8427422
					}
					

					var response = await fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+encodeURI(user_name), {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": config.riot_key
						}
					});
					user_data = await response.json()
					
					if(user_data.id == undefined){interaction.reply({ephemeral:true,content:"\\💣		nom d'utilisateur non trouvé"}); break;}
					

					var response = await fetch('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+user_data.id, {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": config.riot_key
						}
					});
					ranked_data = await response.json()
					console.debug("https://cdn.discordapp.com/avatars/"+client.user.id+"/"+client.user.avatar+".webp")
					var embeds = []
					for (const i in ranked_data) {
						var win_rate = 100 * (ranked_data[i].wins) /(ranked_data[i].wins+ranked_data[i].losses)
						var myEmbed = new Builders.Embed()
						.setColor(alias_rank[ranked_data[i].tier])
						.setTitle(ranked_data[i].tier+" "+ranked_data[i].rank)
						.setAuthor({name:ranked_data[i].queueType+" of "+user_data.name , iconURL : "http://ddragon.leagueoflegends.com/cdn/11.22.1/img/profileicon/"+user_data.profileIconId+".png" })
						.setDescription(ranked_data[i].leaguePoints+" LP")
						.setThumbnail("http://media.rostro15.fr/img/"+ranked_data[i].tier+".png")
						.addFields({name:"wins",value:""+ranked_data[i].wins,inline:true})
						.addFields({name:"losses",value:""+ranked_data[i].losses,inline:true})
						.addFields({name:"win rate",value:""+win_rate+"%",inline:true})					
						.setTimestamp()
						.setFooter({text:"insane", icon_url:"https://cdn.discordapp.com/avatars/"+client.user.id+"/"+client.user.avatar+".webp"})
						embeds.push(myEmbed)
					}
					if(embeds[0] == undefined ){interaction.reply({content:"\\💣		cette utilisateur n'as pas de rang classer"}); break;}
					interaction.reply({embeds:embeds})

				break;
				case "lol_trivia" :
					var user_name = args.get("user_name").value;
					var response = await fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+encodeURI(user_name), {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": config.riot_key
						}
					});
					user_data = await response.json()
					if(user_data.id == undefined){interaction.reply({ephemeral:true,content:"\\💣		nom d'utilisateur non trouvé"}); break;}
					// dMAznnH7CeZkeLzXyoIw6u547EYwt1fHBbzeZaPIXcuth99GPpSb7UURYa2zWbYcZvfudvy7Fkl5TA
					var response = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/'+user_data.puuid+'/ids?start=0&count=1', {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": config.riot_key
						}
					});
					var match_id = await response.json()
					var response = await fetch('https://europe.api.riotgames.com/lol/match/v5/matches/'+match_id[0], {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": config.riot_key
						}
					});
					var match_data = await response.json()





				break;
				case "gifmanager":
					if(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id) == undefined){
						await client.api.interactions(interaction.id, interaction.token).callback.post({
							data: {
								type: 4,
								data: {
										content:"\\💣		ecrivez un message dans n'importe quel salon du serveur visible par le bot puis refaite votre commande",
										flags:64,
								}
							}
						})
						break;
					}

					if(client.check_perm(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id))){

						var rawdata = fs.readFileSync("guild_sto/"+interaction.guild.id+'.json');
						var sto = JSON.parse(rawdata);
						var mot_clef = args[1].value.toLowerCase()
						switch (args[0].value){
						case "add":

						sto.gif[mot_clef] = args[2].value;
						
						interaction.reply({ephemeral:true,content:"\\✅		gif bien ajouté"});

						break;
						case "del":
							delete sto.gif[mot_clef];
							
							interaction.reply({ephemeral:true,content:"\\✅		gif bien suprimer"});
						break;
						}
						var data = JSON.stringify(sto);
						fs.writeFileSync("guild_sto/"+interaction.guild.id+'.json', data);

					}else{
						interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cette commande rip"});
					}

				break;
				case "admin":
					if(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id) == undefined){
						interaction.reply({ephemeral:true,content:"\\💣		ecrivez un message dans n'importe quel salon du serveur visible par le bot puis refaite votre commande"});
						break;
					}

					if(client.check_perm(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id))){
						var msg = "\\💣		une erreur inconnu est survenue (sad \\😢)"
						var member = client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id);
						switch (args[0].name){
						case "init":
							var salon_role = {
								vocal_role:{},
								gif:{"test":"https://media.discordapp.net/attachments/374326170826833937/852145291683692595/1280px-Philips_PM5544.png?width=935&height=701"}
							};
							var data = JSON.stringify(salon_role);
							fs.writeFileSync("guild_sto/"+interaction.guild.id+'.json', data);
							msg = "\\✅		bot initialiser sur le serveur (nrml)"

						break;
						case "link":
							var salonID =  member.voice.channelID;
							if (salonID == null) { msg ='\\⛔		vous devez etre dans un salon vocal';
							}else{
								switch (args[0].options[0].name){
								case "add":
										var roleID = Object.keys(interaction.data.resolved.roles)[0];

										var rawdata = fs.readFileSync("guild_sto/"+interaction.guild.id+'.json');
										var guild_sto = JSON.parse(rawdata);

										guild_sto.vocal_role[salonID] = roleID;

										var data = JSON.stringify(guild_sto);
										
										fs.writeFileSync("guild_sto/"+interaction.guild.id+'.json', data);
										msg = '\\✅		salon link avec le role (nrml)';

								break;
								case "del":
									var rawdata = fs.readFileSync("guild_sto/"+interaction.guild.id+'.json');
									var guild_sto = JSON.parse(rawdata);

									member.roles.remove(guild_sto.vocal_role[salonID]);
									delete guild_sto.guild_sto[salonID]

									var data = JSON.stringify(guild_sto);
									fs.writeFileSync("guild_sto/"+interaction.guild.id+'.json', data);
									msg = '\\✅		salon unllink (nrml)';

								break;
								}
							}

						break;
						case "globallink":
							switch(args[0].options[0].name){
								case "add":
									var roleID = Object.keys(interaction.data.resolved.roles)[0];
									var rawdata = fs.readFileSync("guild_sto/"+interaction.guild.id+'.json');
									var guild_sto = JSON.parse(rawdata);

									guild_sto.vocal_role["global"] = roleID;

									var data = JSON.stringify(guild_sto);
									fs.writeFileSync("guild_sto/"+interaction.guild.id+'.json', data);
									msg = '\\✅		role global link (nrml)';
								break;
								case "del":
									var rawdata = fs.readFileSync("guild_sto/"+message.guild.id+'.json');
									var guild_sto = JSON.parse(rawdata);

									guild_sto.vocal_role["global"] = undefined;

									var data = JSON.stringify(guild_sto);
									fs.writeFileSync("guild_sto/"+message.guild.id+'.json', data);
									msg = '\\✅		role global unlink (nrml)';
								break;
							}
						break;
						}
						interaction.reply({ephemeral:true,content:msg});
					}else{
						interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cette commande rip"});
					}
				break;
				case "call":
					const modal = new Discord.ModalBuilder().setTitle("test").setCustomId("oskoyr");

					const modalTextInput = new Discord.TextInputBuilder().setCustomId("call_name").setLabel("Nom du call").setStyle(Discord.TextInputStyle.Short);
					const modalTextInput_max = new Discord.TextInputBuilder().setCustomId("call_max").setLabel("Nombre de place").setStyle(Discord.TextInputStyle.Short).setRequired(false).setValue("5");
				
				
					const rows = new Discord.ActionRowBuilder().addComponents(modalTextInput);
					modal.addComponents(rows)
					const rows_max = new Discord.ActionRowBuilder().addComponents(modalTextInput_max);
					modal.addComponents(rows_max)
				
					await interaction.showModal(modal);
				break;
				case "add_call_button":
					if(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id) == undefined){
						interaction.reply({ephemeral:true,content:"\\💣		ecrivez un message dans n'importe quel salon du serveur visible par le bot puis refaite votre commande"});
						break;
					}

					if(!client.check_perm(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id))){
						interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cette commande rip"});
					}
					await interaction.reply({
						content:"pour creer un call cliquer sur le bouton",
						components:[{
							"type": 1,
							
							"components":[{
								"type": 2,
								"style": 3,
								"label":"CALL",
								"emoji":{
									"id": null,
									"name":"👍"
								},
								"custom_id": "create_call_button"
							},
							],
						}],
						fetchReply:true
					})
				break;
				case "modifycall":
					var members_ID = args.getMember("user").user.id;
					
					if(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id) == undefined){

						interaction.reply({ephemeral:true,content:"\\💣		ecrivez un message dans n'importe quel salon du serveur visible par le bot puis refaite votre commande"});
						break;
					}

					if(!client.check_perm(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id))){

						interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cette commande rip"});
						break;
					};

					var mess_relpy_ID = args.get("messageid").value

					if(client.call_list[mess_relpy_ID] == undefined ){
						interaction.reply({ephemeral:true,content:"\\💣		l'ID de message ne corespond pas a un call"});
						break;
					}


					client.users.fetch(members_ID)
					.then(function(members_a_mod){

						if(args.get("action").value=="add"){
						
							if (client.call_list[mess_relpy_ID].max == 0){
								client.myem.emit(mess_relpy_ID, "join", members_a_mod )
							}else{
								client.myem.emit(mess_relpy_ID, "join", members_a_mod )								
							}
						}else{
							if (client.call_list[mess_relpy_ID].max == 0){
								client.myem.emit(mess_relpy_ID, "leave", members_a_mod )	
							}else{
								client.myem.emit(mess_relpy_ID, "leave", members_a_mod )	
							}
			
						}

					});

					
					interaction.reply({ephemeral:true,content:"\\✅		call bien modifier (nrml)"});

				break;
				case "tictactoe":
					
					var J1 = interaction.user;

					var J2 = interaction.options.get("adversaire");
						
					var txt = "🟥"+J1.toString() + " contre 🟩" + J2.toString();
					
					var embed = new Builders.Embed()
					.setColor('5763719')
					.setDescription(txt)


					var msg = {
						"embeds":[embed],
						"components": [{
							"type": 1,
							"components":[{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"emoji":"",
								"custom_id": "0"
							},{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"custom_id": "1"
							},{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"custom_id": "2"
							},
							]
						},{
							"type": 1,
							"components":[{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"custom_id": "10"
							},{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"custom_id": "11"
							},{
								"type": 2,
								"style": 2,
								"label":"\u200B",
								"custom_id": "12"
							},
						]
						},{
							"type": 1,
							"components":[{
									"type": 2,
									"style": 2,
									"label":"\u200B",
									"custom_id": "20"
								},{
									"type": 2,
									"style": 2,
									"label":"\u200B",
									"custom_id": "21"
								},{
									"type": 2,
									"style": 2,
									"label":"\u200B",
									"custom_id": "22"
								},
							]
						},{
							"type": 1,
							"components":[{
								"type": 2,
								"style": 4,
								"label":"stop",
								"custom_id": "stop"
							}
						]
						}]
					
					}
	
					interaction.reply(msg);
					
					mess_reply = client.guilds.cache.get(interaction.guild.id).me.lastMessage;
					tictactoe(interaction, msg, mess_reply, embed);

					
					

					
					
				break;
				case "game":

					var guild = client.guilds.cache.get(interaction.guildId)
					member = guild.members.cache.get(interaction.member.user.id);
					var salonID = member.voice.channelId;
					if (salonID == null) { interaction.reply({ephemeral:true,content:'\\⛔		vous devez etre dans un salon vocal'})
					}else{

						/*var rep = await client.api.channels(salonID).invites.post({
							data:{
								
								"target_type":2,
								"target_application_id":args.get("jeu").value
							}
						})*/
						var rep = await member.voice.channel.createInvite({maxAge:86400, maxUses:0, unique:false, targetApplication:args.get("jeu").value, targetType:2})

						interaction.reply("https://discord.gg/"+rep.code)

					}
				break;
				
				
				case "brotransform":
					var member = interaction.options.getMember("bro")
					var role = await interaction.guild.roles.fetch("1042070248758722570");
					member.roles.add(role)
					interaction.reply({ephemeral:false, content: member.toString()+" est maintenant un turbo bro"});
				break;
				default:
					interaction.reply({ephemeral:true,content:"\\💣		une erreur inconnue a eu lieu"});
			}
		break;
		case 4:
			switch(interaction.commandName){
			case "modifycall":
				var sto = new Array()
				Object.keys(client.call_list).forEach(callID => {
					sto.push({
						name:client.call_list[callID].titre,
						value:callID
					})
				});
				interaction.respond(sto)

			break;
			}
		break;
	}
});

client.on("guildCreate", function(guild){
	var salon_role = {
		vocal_role:{},
		gif:{"test":"https://media.discordapp.net/attachments/374326170826833937/852145291683692595/1280px-Philips_PM5544.png?width=935&height=701"}
	};
	var data = JSON.stringify(salon_role);
	fs.writeFileSync("guild_sto/"+guild.id+'.json', data);
});


// declanche un evenement lors d'une maj du status d'une personne 
client.on("voiceStateUpdate", function(oldState, newState) {
	// récupère l'objet membre complet
	newState.guild.members.fetch(oldState.id)
  	.then(member => {
		
  		if (newState.channelId	!= oldState.channelId ) { //on regarde si il y a un changement de salon

  			var rawdata = fs.readFileSync("guild_sto/"+newState.guild.id+'.json');
			var guild_sto = JSON.parse(rawdata);
			//on enleve l'eventuel role du salon précedent
			for(var key in guild_sto.vocal_role) {
		  		var value = guild_sto.vocal_role[key];
		  		if (key == oldState.channelID ) {
		  			member.roles.remove(value);
		  			console.info("del : "+member.displayName);
		  		}
			}

			
			for(var key in guild_sto.vocal_role) {
		  		var value = guild_sto.vocal_role[key];

		  		if (key == newState.channelID ) {
		  			member.roles.add(value);
		  			console.info("add : "+member.displayName);
		  		}
			}
		if(guild_sto.vocal_role["global"] != undefined){
			if (newState.channelID == null && oldState.channelID != null) {
				member.roles.remove(guild_sto.vocal_role["global"]);
			}else if (newState.channelID != null && oldState.channelID == null)
				member.roles.add(guild_sto.vocal_role["global"]);
			}
		}
  	});
});





client.login(config.BOT_TOKEN);
