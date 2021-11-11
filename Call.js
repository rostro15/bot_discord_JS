const fs = require('fs');
const Discord = require("discord.js");
class Call{
	constructor(){
		this.client = arguments[0];
		if(arguments[2] == undefined){
			this.CreatFromInteraction(arguments[1])
		}else{
			this.CreateFromCache(arguments[1], arguments[2])
		}
	}

	async CreateFromCache(channelID, messageID){
		try {
			var channel = await this.client.channels.fetch(channelID)
			var message = await channel.messages.fetch(messageID)
		} catch (error) {
			if(error = "DiscordAPIError: Unknown Message" || error =="DiscordAPIError: Unknown Channel" || error =="TypeError: Cannot read property 'channel' of undefined"){
				var rawdata = fs.readFileSync("call_sto/call_sto.json");
				var fileData = JSON.parse(rawdata);

				delete fileData[messageID];

				var data = JSON.stringify(fileData);
				fs.writeFileSync("call_sto/call_sto.json", data);
				console.error(error);
				console.log("call non trouvé");
				return
			}
			console.error(error);
		}

		
		this.mess_relpy =  message;
		this.messID =  message.id;
		this.auteur = {user: message.author};
		this.myEmbed = message.embeds[0];
		if(this.myEmbed.footer == null){
			this.max = 0;
		}else{
			this.max = parseInt(this.myEmbed.footer.text.split("/")[1]);
			this.cmpt = parseInt(this.myEmbed.footer.text.split("/")[0]);
		}

		if(this.myEmbed.description == null){
			this.myEmbed.setDescription("");
			this.sto = [];
		}else{
			this.sto = this.myEmbed.description.split("\n");
		}

		console.log("call found : " + this.myEmbed.title);
		this.open_listeners();
	}


	async CreatFromInteraction(interaction){

		const titre_msg = interaction.options.get("message").value;
		this.titre = titre_msg;
		var max = 0;
		if(interaction.options.get("max") != null){max = interaction.options.get("max").value;} 

		var pseudo_auteur = interaction.member.user.username;
		if (interaction.member.nick != null) {pseudo_auteur = interaction.member.nick;}
		if(interaction.channel.isThread()){
			interaction.reply("\\😢");
			delete this;
			return;
		}

		console.log("call crée par : "+interaction.member.user.username);
		var myEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle(titre_msg)
		.setAuthor(pseudo_auteur, "https://cdn.discordapp.com/avatars/"+interaction.member.user.id+"/"+interaction.member.user.avatar+".webp")
		.setDescription("")
		.setTimestamp()

		this.auteur = interaction.member;
		this.sto = [];
		this.max = max;
		this.myEmbed = myEmbed;

		var mess_relpy  = await interaction.reply({
			embeds:[myEmbed], 
			components:[{
				"type": 1,
				"components":[{
					"type": 2,
					"style": 3,
					"emoji":{
						"id": null,
						"name":"👍"
					},
					"custom_id": "join"
				},{
					"type": 2,
					"style": 1,
					"emoji":{
						"id": null,
						"name":"📯"
					},
					"custom_id": "bell"
				}
				]},
				{
				"type": 1,
				"components":[{
					"type": 2,
					"style": 4,
					"emoji":{
						"id": null,
						"name":"👎"
					},
					"custom_id": "leave"
				},{
					"type": 2,
					"style": 4,
					"emoji":{
						"id": null,
						"name":"✖️"
					},
					"custom_id": "close"
				}
				]}
			],
			fetchReply:true
		})

		this.mess_relpy =  mess_relpy;
		this.mess_relpy.startThread({name:titre_msg, reason: "création d'un call"})
		this.messID = mess_relpy.id;
		this.client.call_list[this.messID] = this;

		if (max!=0) {
			var temp="";
			for (var i = 0; i < max; i++) {
				temp = temp + "\n@XXXXXXX";
			}

			this.cmpt = 0;
			this.myEmbed.setDescription(temp);
			this.myEmbed.setFooter("0/"+max);
			this.update()

			for (var i = 0 ; i <= max - 1; i++) {
				this.sto.push("@XXXXXXX");
			}
		}

		var rawdata = fs.readFileSync("call_sto/call_sto.json");
		var fileData = JSON.parse(rawdata);

		fileData[this.mess_relpy.id] = this.mess_relpy.channel.id;

		var data = JSON.stringify(fileData);
		fs.writeFileSync("call_sto/call_sto.json", data);

		this.open_listeners(interaction);
		
		
	}

	open_listeners(){

		var call = this;
		this.client.myem.on(this.mess_relpy.id, async function (interaction) {
			var command;
			var member;
			if(arguments[1] != undefined ){
				command = arguments[0]
				member = arguments[1]
			}else{
				command = interaction.customId;
				member = await call.client.guilds.cache.get(interaction.guild.id).members.fetch(interaction.member.user.id)
			}
			
			switch(command){
				case "join":
					await call.add(member)
					if(arguments[1] == undefined ){interaction.deferUpdate()}
				break;
				case "leave":
					await call.remove(member)
					if(arguments[1] == undefined ){interaction.deferUpdate()}				

				break;
				case "bell":
					await call.bell(member, interaction);
				break;
				case "close":
					await call.del(member, interaction);
				break;
			}
		})
	}

	async update(){
		this.mess_relpy.edit({
			embeds:[this.myEmbed], 
			components:[{
				"type": 1,
				"components":[{
					"type": 2,
					"style": 3,
					"emoji":{
						"id": null,
						"name":"👍"
					},
					"custom_id": "join"
				},{
					"type": 2,
					"style": 1,
					"emoji":{
						"id": null,
						"name":"📯"
					},
					"custom_id": "bell"
				}
				]},
				{
				"type": 1,
				"components":[{
					"type": 2,
					"style": 4,
					"emoji":{
						"id": null,
						"name":"👎"
					},
					"custom_id": "leave"
				},{
					"type": 2,
					"style": 4,
					"emoji":{
						"id": null,
						"name":"✖️"
					},
					"custom_id": "close"
				}
				]}
			],
			fetchReply:true
		})
	}

	async delete(){	
		try {
			try {await this.mess_relpy.thread.setArchived(true,"call fini")}catch{}
			this.client.myem.removeAllListeners(this.messID);
			await this.mess_relpy.delete();
			delete this.client.call_list[this.messID];
			delete this;
		} catch (error) {console.dir(error)}
		
	}

	add(user){
		try {this.mess_relpy.thread.members.add(user);}catch{}
		if(this.max == 0){
			this.add_non_max(user)
		}else{
			this.add_max(user)
		}
	}

	remove(user){
		if(this.max == 0){
			this.remove_non_max(user)
		}else{
			this.remove_max(user)
		}
	}


	add_non_max(user){
		var k = true;
		for( var i = 0; i < this.sto.length; i++){    
			if (this.sto[i] == user.toString()){
				var k = false;
			}
		}
		if(k){
			this.sto.push(user.toString());
			this.myEmbed.setDescription(this.myEmbed.description+"\n"+user.toString());
			this.update();

			console.log("call : add "+user.displayName);
		}
	}
	remove_non_max(user){
		
		this.myEmbed.setDescription(this.myEmbed.description.replace("\n"+user.toString(),""));
		this.myEmbed.setDescription(this.myEmbed.description.replace(user.toString(),""));
		this.update();
		//enleve le user du sto
		for( var i = 0; i < this.sto.length; i++){        
			if (this.sto[i] === user.toString()) { 
				this.sto.splice(i, 1); 
				i--;
				console.log("call : remove "+user.displayName);
			}
		}
	}

	add_max(user){
		var k = true;
		for( var i = 0; i < this.sto.length; i++){    
			if (this.sto[i] == user.toString()){
				var k = false;
			}
		}	
		if(k){
			for (var i = 0 ; i <= this.sto.length - 1; i++) {
				if (this.sto[i]=="@XXXXXXX"){
					this.sto[i] = user.toString();
					this.cmpt++;

					var sto = "";
					for (var i = 0;	this.sto.length - 1 >=i; i++) {
						sto = sto+"\n"+this.sto[i];
					}

					this.myEmbed.setFooter(this.cmpt+"/"+this.max);
					this.myEmbed.setDescription(sto);
					this.update();
					console.log("call : add "+user.displayName);
					break;
				}
			}
		}
		
	}
	remove_max(user){

		this.myEmbed.setDescription(this.myEmbed.description.replace(user.toString(),"@XXXXXXX"));
		for( var i = 0; i < this.sto.length; i++){        
			if (this.sto[i] == user.toString()) { 
				this.sto[i] = "@XXXXXXX";
				this.cmpt--;
				console.log("call : remove "+user.displayName);
			}
		}
		
		this.myEmbed.setFooter(this.cmpt+"/"+this.max);
		this.update();
	}

	bell(member, interaction){
		if(this.auteur.user.id == member.user.id || this.client.check_perm(member)){
			var sto = "";
			this.mess_relpy.channel.send(":bellhop::bellhop::bellhop::bellhop:")
			for(var key in this.sto) {
				if (this.sto[key] != "@XXXXXXX") {

					sto = sto + this.sto[key];
					sto = sto + "\n";
				}
			}
			if(sto==""){
				sto = "\\😥";
			}

			this.mess_relpy.channel.send(sto);

			this.mess_relpy.channel.send(":bellhop::bellhop::bellhop::bellhop:")

			var rawdata = fs.readFileSync("call_sto/call_sto.json");
			var fileData = JSON.parse(rawdata);

			delete fileData[this.mess_relpy.id];

			var data = JSON.stringify(fileData);
			fs.writeFileSync("call_sto/call_sto.json", data);

			this.delete();
			
			interaction.deferUpdate()
		}else{
			interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cela rip"});
		}
	}

	del(member, interaction){
		if(this.auteur.user.id == member.user.id || this.client.check_perm(member)){
			console.log("call close par : "+interaction.member.user.username);

			var rawdata = fs.readFileSync("call_sto/call_sto.json");
			var fileData = JSON.parse(rawdata);

			delete fileData[this.mess_relpy.id];

			var data = JSON.stringify(fileData);
			fs.writeFileSync("call_sto/call_sto.json", data);


			this.delete();
			interaction.deferUpdate()
		}else{
			interaction.reply({ephemeral:true,content:"\\⛔		vous n'avez pas les droits pour faire cela rip"});
		}
	}
}

module.exports = Call;