const Discord = require("discord.js");
const fs = require('fs');
const events = require('events');
const { inspect } = require('util');

const fetch = require('node-fetch');
const intro = [
'////////////////////////////////////////////////////////////////',
'///////////             BOT DISCORD v5.0             ///////////',
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
	for(var key in intro) {
		console.dir(intro[key]);
	}
	client.user.setActivity('/help', { type: 'WATCHING' })


	console.log('I am ready! 🚀');
	console.log("📡 Connecter en tant que : "+client.user.tag);

	console.log("\nListe des commandes :");
	await client.api.applications(client.user.id).commands.get()
    .then(result => {
		for(var key in result) {
			var value = result[key];
			console.log("/"+value.name);
		} 
		console.log("");
	})

    //recrée les calls
	var rawdata = fs.readFileSync("call_sto/call_sto.json");
	var fileData = JSON.parse(rawdata);
	for(var key in fileData) {
		var value = fileData[key];
		new Call(client, value, key);
	}

	client.guilds.cache.each(guild => { //liste des guilds dans lequelles il y a le bot
		console.dir(guild.name);
		guilds[guild.id] = guild
	})
	client.guilds_list = guilds



});


client.on("messageCreate", async function(message) {
	if(message.author.bot)return;
	var msg = message.content.toLowerCase()
	var rawdata = fs.readFileSync("guild_sto/"+message.guild.id+'.json');
	var sto = JSON.parse(rawdata);

	for(var key in sto.gif) {//gestion des gifs
		var value = sto.gif[key];
		key = key.split(" + ");
		if (client.check_all_in(key,msg)) {
			message.channel.send(value);
			console.log("send : "+key);
		}
  	}

	var args = message.content.split(' ');
	var command = args.shift().toLowerCase();

	if (command === 'eval') {//commande de debug

		if (!config.admin_ID.includes(message.author.id)) return;
		
		var evaled;
		var return_value = "";
		try {
		  evaled = await eval(args.join(' '));
		  return_value = "```json\n"+inspect(evaled)+"```";
		  
		  console.log(inspect(evaled, depth=1, colorize=true));
		}catch (error) {
		  console.error(error.toString());
		  return_value = "```"+error.stack+"```"
		}
		return_value = return_value.match(/.{1,50}/g)
		console.dir(return_value)
		for (i in return_value){
			message.channel.send(return_value[i]);
			//console.dir(i)
		}

	}
});

client.on('interactionCreate', async interaction => {
	var command = "erreur";
	//console.dir(interaction)
	switch(interaction.type){
		case "MESSAGE_COMPONENT": //commande issue des component
			if(!client.myem.emit(interaction.message.id, interaction)){
				
				if(!client.myem.emit(interaction.message.interaction.id, interaction)){
					interaction.deferUpdate()
				}
			}
		break;
		case "APPLICATION_COMMAND": //commande issue des commandes slash
			command = interaction.commandName.toLowerCase();
			const args = interaction.options;
			switch(command) {
				case "help":
					new Help(client,interaction)
				break;
				case "lol_stat":
					var user_name = args.get("user_name").value;
					
					const alias_rank = {
						BRONZE:"#87462b",
						CHALLENGER:"#f8e5da",
						DIAMOND:"#47318d",
						GOLD:"#e4b657",
						GRANDMASTER:"#fc463b",
						IRON:"#2a1a18",
						MASTER:"#da2beb",
						PLATINUM:"#3b7877",
						SILVER:"#80979e"
					}
					

					var response = await fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+encodeURI(user_name), {
						method: 'get',
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
							"Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
							"Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
							"Origin": "https://rostro15.fr",
							"X-Riot-Token": "RGAPI-d33d2be1-76d3-41d9-bf27-7d784c496b7c"
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
							"X-Riot-Token": "RGAPI-d33d2be1-76d3-41d9-bf27-7d784c496b7c"
						}
					});
					ranked_data = await response.json()

					var embeds = []
					for (const i in ranked_data) {
						var win_rate = 100 * (ranked_data[i].wins) /(ranked_data[i].wins+ranked_data[i].losses)
						var myEmbed = new Discord.MessageEmbed()
						.setColor(alias_rank[ranked_data[i].tier])
						.setTitle(ranked_data[i].tier+" "+ranked_data[i].rank)
						.setAuthor(ranked_data[i].queueType+" of "+user_data.name, "http://ddragon.leagueoflegends.com/cdn/11.22.1/img/profileicon/"+user_data.profileIconId+".png")
						.setDescription(ranked_data[i].leaguePoints+" LP")
						.setThumbnail("http://rostro15.fr/node/img/"+ranked_data[i].tier+".png")
						.setFields([
							{name:"wins",value:""+ranked_data[i].wins,inline:true},
							{name:"losses",value:""+ranked_data[i].losses,inline:true},
							{name:"win rate",value:win_rate.toFixed(2)+" %",inline:false}
						])
						.setTimestamp()
						.setFooter("insane","https://cdn.discordapp.com/avatars/"+client.user.id+"/"+client.user.avatar+".webp")
						embeds.push(myEmbed)
					}
					if(embeds[0] == undefined ){interaction.reply({content:"\\💣		cette utilisateur n'as pas de rang classer"}); break;}
					interaction.reply({embeds:embeds})



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
					var call = client.create_call(em, interaction);
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
					/*
					var J1_ID = Object.keys(interaction.options.resolved.members);
					client.users.fetch(J1_ID)
					.then(function(J1){

						var J2_ID = interaction.member.user.id;
						client.users.fetch(J2_ID)
						.then(async function(J2){
						
							var txt = "🟥"+J1.toString() + " contre 🟩" + J2.toString();
							
							var embed = new Discord.MessageEmbed()
							.setColor('#57F287')
							.setTitle("")
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
			
							await client.api.interactions(interaction.id, interaction.token).callback.post({
								data:{
									"type": 4,
									"flags": 0,
									"data": msg
								}
							})
							
							mess_reply = client.guilds.cache.get(interaction.guild.id).me.lastMessage;
							tictactoe(interaction, msg, mess_reply, embed);
						
						
						
						})
					})
					

					
					*/
				break;
				case "game":
					if(client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id) == undefined){
						interaction.reply({ephemeral:true,content:"\\💣		ecrivez un message dans n'importe quel salon du serveur visible par le bot puis refaite votre commande"});
						break;
					}
					var member = client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.member.user.id);
					var salonID =  member.voice.channelId;
					if (salonID == null) { interaction.reply({ephemeral:true,content:'\\⛔		vous devez etre dans un salon vocal'})
					}else{

						var rep = await client.api.channels(salonID).invites.post({
							data:{
								
								"target_type":2,
								"target_application_id":args.get("jeu").value
							}
						})

						interaction.reply("https://discord.gg/"+rep.code)

					}
				break;
				default:
					interaction.reply({ephemeral:true,content:"\\💣		une erreur inconnue a eu lieu"});
			}
		break;
		case "APPLICATION_COMMAND_AUTOCOMPLETE":
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
		  			console.log("del : "+member.displayName);
		  		}
			}

			
			for(var key in guild_sto.vocal_role) {
		  		var value = guild_sto.vocal_role[key];

		  		if (key == newState.channelID ) {
		  			member.roles.add(value);
		  			console.log("add : "+member.displayName);
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
