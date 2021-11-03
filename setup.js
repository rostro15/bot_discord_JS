const Discord = require('discord.js');
const config = require("./config.json");
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    /*client.api.applications(client.user.id).commands.post({
        data: {
            name: "help",
            description: "help command"
            // possible options here e.g. options: [{...}]
        }
    });


    client.api.applications(client.user.id).commands.post({
        data: {
            name: "admin",
            type: 2,
            description: "liste des commande admin",
            options:[{
                name: "link",
                type: 2,
                description: "commande de link role salon",
                options:[
                    {
                        name: "add",
                        type: 1,
                        description: "lie le role avec le salon ds le quelle vous etes",
                        options:[
                        {
                            name: "role",
                            type:8,
                            description: "role a ajouté",
                            required: true
                        }]
                    },
                    {
                        name: "del",
                        type: 1,
                        description: "delie le salon vocal ds le quelle vous etes"
                    }
                    ]
                },{
                    name: "globallink",
                    type: 2,
                    description: "commande de lien global",
                    options:[
                        {
                            name: "add",
                            type: 1,
                            description: "set le role comme role invocal",
                            options:[
                            {
                                name: "role",
                                type:8,
                                description: "role a definir comme global",
                                required: true
                            }]
                        },
                        {
                            name: "del",
                            type: 1,
                            description: "delie le globallink"
                        }
                    ]
                },{
                    name: "init",
                    type:1,
                    description: "commande de (re)mise a zero"
                }
            ]


            
            // possible options here e.g. options: [{...}]
        }
    });


    client.api.applications(client.user.id).commands.post({
        data: {
            name: "call",
            type: 1,
            description: "commande pour crée un appelle",
            options:[
                {
                    name: "message",
                    type: 3,
                    description: "message a afficher",
                    required:true
                },
                {
                    name: "max",
                    type:4,
                    description: "nombre max de joueurs",
                    required:false
                }
            ]
            // possible options here e.g. options: [{...}]
        }
    });*/

    /*
    client.api.applications(client.user.id).commands.post({
        data: {
            name: "gifmanager",
            type: 1,
            description: "ajoute ou suprime un gif",
            options:[
                {
                    name: "action",
                    type: 3,
                    description: "action a realiser",
                    required:true,
                    choices:[
                        {
                            name:"add",
                            value:"add"
                        },
                        {
                            name:"del",
                            value:"del"
                        }
                    ]
                },
                {
                    name: "motsclef",
                    type:3,
                    description: "mots clef",
                    required:true
                },
                {
                    name: "gif",
                    type:3,
                    description: "lien du gif a lier (laisser vide si del)",
                    required:false
                },
            ]
        }
    });*/

    /*client.api.applications(client.user.id).commands.post({
        data: {
            name: "XXXXXXXXX______(('é",
            type: 1,
            description: "ajoute ou suprime un gif",
            options:[
                {
                    name: "XXXXX",
                    type: 3,
                    description: "action a realiser",
                    required:true,
                    choices:[
                        {
                            name:"add",
                            value:"add"
                        },
                        {
                            name:"del",
                            value:"del"
                        }
                    ]
                },
                {
                    name: "XXXXXXXXX",
                    type:3,
                    description: "mots clef",
                    required:true
                },
                {
                    name: "XXXXXXXXXXXXX",
                    type:3,
                    description: "lien du gif a lier (laisser vide si del)",
                    required:false
                },
            ]
        }
    });*/

    /*client.api.applications(client.user.id).commands.post({
        data: {
            name: "tictactoe",
            type: 1,
            description: "jeu du morpion",
            options:[{
                name: "adversaire",
                type:6,
                description: "votre ennemie",
                required:true
            }]
        }
    });*/



    client.api.applications(client.user.id).commands("843555178141188167").patch({
        data:{
        "type": 1,
        "name": "modifycall",
        "description": "modifie un /call",
        "options": [
            {
                "type": 3,
                "name": "action",
                "description": "action a realiser",
                "required": true,
                "choices": [
                    {
                        "name": "add",
                        "value": "add"
                    },
                    {
                        "name": "del",
                        "value": "del"
                    }
                ]
            },
            {
                "type": 3,
                "name": "messageid",
                "description": "ID du message call a modifier",
                "required": true,
                "autocomplete":true
            },
            {
                "type": 6,
                "name": "user",
                "description": "utilisateur à add/del",
                "required": true
            }
        ]
    }   });



    /*client.api.applications(client.user.id).guilds('374326170826833933').commands.post({
        data: {
            name: "test",
            type: 1,
            description: "test commande",
            options:[{
                name: "adversaire",
                type:6,
                description: "votre ennemie",
                required:true
            }]
        }
    });*/



    /*client.api.applications(client.user.id).guilds('374326170826833933').commands.post({
        data: {
            name: "test",
            type: 3,
            
            
        }
    });*/






    client.api.applications(client.user.id).commands.get()
    .then(result => console.dir(result))
console.dir(client.user.id)
});





client.login(config.BOT_TOKEN);