const winston = require('winston');

const config = {
    levels: {
      error: 0,
      debug: 1,
      warn: 2,
      data: 3,
      info: 4,
      verbose: 5,
      dir: 6,
      custom: 7
    },
    colors: {
      error: 'red',
      debug: 'blue',
      warn: 'yellow',
      data: 'grey',
      info: 'green',
      verbose: 'cyan',
      dir: 'magenta',
      custom: 'yellow'
    }
};
  
winston.addColors(config.colors);

const console = winston.createLogger({
	levels: config.levels,	
    level:'custom',
    format: winston.format.combine(
      winston.format.colorize({
        all:true
      }),
      winston.format.timestamp({
        format: 'DD-MM-YYYY HH:mm:ss'
      }),
      winston.format.simple(),
      winston.format.printf(info => `[${info.timestamp}] ${info.message}`)
    ),

	transports: [
	  new winston.transports.File({ format: winston.format.combine(
        winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss'
        }),
        winston.format.simple(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    filename: 'combined.log' }),
	],

  exceptionHandlers: [
    new winston.transports.Console({
      exitOnError: false 
    })
  ]
});

console.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'DD-MM-YYYY HH:mm:ss'
      }),
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(info => `[${info.timestamp}] ${info.message}`)
    ),
}));




exports.console = console;
