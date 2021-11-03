const fs = require('fs');
const Discord = require("discord.js");
const events = require('events');
const Call = require('./Call');

const config = require("./config.json");

class monClient extends Discord.Client {
	constructor(){
        
        super({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
        this.myem = new events.EventEmitter();
        this.call_list = {}
	}

    create_call(){
        
        if(arguments[2] == undefined){
			return new Call(this, arguments[1])
		}else{
			return new Call(this, arguments[1], arguments[2])
		}
	}
    
    ///////////////////////////////////////////////// fonctions generale /////////////////////////////////////////////////
    check_perm(member){
        if (member.permissions.any('MANAGE_CHANNELS',true)) {
            return true;
        }
        if (config.admin_ID.includes(member.id)) {
            return true;
        }
        return false;
    }


    check_all_in(keys, msg){
        for(var i in keys ){
            if (!msg.includes(keys[i])) {
                return false;
        }
        return true;
        }
    }




}

module.exports = monClient;