/*!
 * TamataSpiru
 * Copyright(c) 2016-2017 Romain Tourte
 * Contact : contact@tamataocean.com
 * MIT Licensed
 */
  
var fs = require('fs')
//var tamatalib = require('./tamataspirulib')
var jsonfile = require('jsonfile')
var moment = require('moment')
//var bootstrap = require('bootstrap')

/* CONFIG for res.render to ejs Front End Files */
/* -------------------------------------------- */
var configFile = './config/config.json';
var ejs_index = 'indexW3.ejs';
var ejs_dashboard = 'dashboardW3.ejs';
var ejs_sched = 'schedW3.ejs';
var ejs_alert = 'alertsW3.ejs';
var ejs_remote = 'remoteW3.ejs';

// Load the full build.
var _ = require('lodash');

/* ------------ I2C ------------ NOT YET... 
var i2c = require('i2c');
var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1'});
 
/* ------------ Express.JS ------------ */  
/* ------------------------------------ */
var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
/*
var router = express.Router();

router.use(function (req,res,next) {
  console.log("Enter Router function :  /" + req.method);
  next();
});
*/
/* On utilise les sessions */
app.use(session({secret: 'tamataSpiru'}))

/* Static files declared */
.use(express.static(__dirname + '/img'))
.use(express.static(__dirname + '/fonts'))
.use(express.static(__dirname + '/css'))
.use(express.static(__dirname + '/js'))

.use(bodyParser.urlencoded({
    extended: true
}))

.use(bodyParser.json())

/* --------------------------- Index print ------------------------ */
/* ---------------------------------------------------------------- */
.get('/', function(req, res) {
	jsonfile.readFile(configFile, function(err, obj) {
		if (err) throw err;
		res.render(ejs_index, {
			title : "TamataSpiru - Home",
			temperature : {
				mc_temperature : 35,
				target_temperature : obj.temperature.target_temperature,
				ext_temperature : 23,
				check_power : true,	//TODO : Check Power consume
				check_temp : true 			//TODO : Check if  14 << temperature MC << 41 & ...
				},
			light : {
				light_UV : 650,
				light_IR : 780,
				check_light : true,			//TODO : + analyse spectrum & data
				check_power : false	//TODO : + Power consume & efficiency... 
				},
			rgb : {
				rgb_red : 47,
				rgb_green : 65,
				rgb_blue : 50,
				check_rgb : true			//TODO : + Check if (Blue << Green << Red)
			},
			check_power_move : true			//TODO : + Check bubler consume.
		});
	})
})
/* ----------------------------- Dashboard ------------------------ */
/* ---------------------------------------------------------------- */
.get('/stats', function(req, res) { 
    res.render(ejs_dashboard, {
		title : 'TamataSpiru Dashboard'
	}
	
	);
})

/* ----------------------------- Remote ------------------------ */
/* ---------------------------------------------------------------- */
.get('/remote', function(req, res) { 
    res.render(ejs_remote, {
		title : 'TamataSpiru Remote Control',
		check_power_move : true,
		temperature : {
			check_power : true,
			check_temp : true 
		},
		light : {
				light_UV : 650,
				light_IR : 780,
				check_light : true,			//TODO : + analyse spectrum & data
				check_power : false	//TODO : + Power consume & efficiency... 
				},
		rgb : {
				check_rgb : true
		}
	}
	
	);
})
.post('/remoteOrder', function(req, res, next) { 
    console.log('remoteOrder send !! ');
	res.redirect('/remote');
	
})
/* ----------------------------- Scheduling ----------------------- */
/* ---------------------------------------------------------------- */
.get('/sched', function(req, res) {
	jsonfile.readFile(configFile, function(err, obj) {
		if (err) throw err;
		res.render(ejs_sched, {
			title : 'TamataSpiru Sched',
			temperature : {
				pwm : obj.temperature.pwm,
				mc_temperature : 35,
				target_temperature : obj.temperature.target_temperature,
				ext_temperature : 23,
				check_power_temp : true,
				check_temp : true, 
				sched : {
					timer_on : obj.temperature.sched.timer_on,
					timer_off : obj.temperature.sched.timer_off
					}
				},
			light : {
				pwm : obj.light.pwm,	
				light_UV : 650,
				light_IR : 780,
				check_light : true,			
				check_power : true, 
				sched : {
					timer_on : obj.light.sched.timer_on,
					timer_off : obj.light.sched.timer_off
					}
			},
			bubler : {
				pwm : obj.bubler.pwm,				
				check_power : true, 
				sched : {
					timer_on : obj.bubler.sched.timer_on,
					timer_off : obj.bubler.sched.timer_off
					}
			}
			
		});
	})	
})
.post('/save_sched', function(req, res, next){
	jsonfile.readFile(configFile, function(err, obj){
		if (err) throw err;
		// Temperature Paramaters
		obj.temperature.target_temperature = parseFloat(req.body.target_temperature);
		obj.temperature.sched.timer_on = req.body.timer_on_temperature;
		obj.temperature.sched.timer_off = req.body.timer_off_temperature;
		
		// Light Paramaters
		obj.light.pwm = req.body.intensity_light;
		obj.light.sched.timer_on = req.body.timer_on_light;
		obj.light.sched.timer_off = req.body.timer_off_light;
		
		// Bubler Parameters
		obj.bubler.pwm = req.body.intensity_bubler;
		obj.bubler.sched.timer_on = req.body.timer_on_bubler;
		obj.bubler.sched.timer_off = req.body.timer_off_bubler;
		
		jsonfile.writeFile(configFile, obj, function(err) {console.error(err)});
		console.log('Sched - Update Config.JSON File'+ JSON.stringify(obj)); // + SEND Event to Update Arduino
		res.redirect('/sched');
	})
})

/* --------------------------- Alerts ----------------------------- */
/* ---------------------------------------------------------------- */
.get('/alert', function(req, res) { 
	jsonfile.readFile(configFile, function(err, obj){
		if (err) throw err;
		res.render(ejs_alert, {
			title: 'TamataSpiru Alerts',
			alert_email:obj.alert_email,
			alert_tel:obj.alert_tel,
			alerts:{
				message:"Info message : no problemo !",
				temperature:{
					max:obj.alerts.temperature.max,
					min:obj.alerts.temperature.min
				},
				light:{
					uv:obj.alerts.light.uv,
					ir:obj.alerts.light.ir
				}
			},
		});
	});
})
.post('/save_alerts', function(req, res, next){
	// req.body object has your form values
	jsonfile.readFile(configFile, function(err, obj){
		if (err) throw err;
		obj.alerts.temperature.min = parseFloat(req.body.temperature_alert_min);
		obj.alerts.temperature.max = parseFloat(req.body.temperature_alert_max);
		
		obj.alerts.light.uv = parseFloat(req.body.light_alert_uv);
		obj.light.alertUV.max = parseFloat(req.body.light_alert_uv);
		
		obj.alerts.light.ir = parseFloat(req.body.light_alert_ir);
		obj.light.alertIR.max = parseFloat(req.body.light_alert_ir);
		
		obj.alert_email = req.body.alert_email;
		obj.alert_tel = req.body.alert_tel;
		
		console.log('Alert - Update Config.JSON '+ JSON.stringify(obj)); // + SEND Event to Update Arduino
		jsonfile.writeFile(configFile, obj, function(err) {console.error(err)});
		res.redirect('/alert');
	})   
})

/* Go to Index if page unknown */
.use(function(req, res, next){
    res.redirect('/');
});

app.on('connect',function(req,res) {
	console.log('new user arrived');
});

app.listen(8080);