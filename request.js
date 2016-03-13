var http = require('http'),
	url = require('url'),
	request = require('request'),
	qs = require('querystring'),
	fs = require('fs'),
	start = new Date().toGMTString(),
	msgc = 0;

function getStatus() {
	return JSON.stringify({
		start : start,
		now : new Date().toGMTString(),
		msg_count : msgc
	});
}
function adminPanel(par, request, response) {
	if (par.opt == 'status') {
		response.write('Your IP: ' + request.headers['x-forwarded-for'] + '\n');
		return response.end(getStatus());
	}
	if (par.opt == 'log'){
		var resul = '';
		try{
			resul = fs.readFileSync('main.log');
		}catch(e){
			resul = 'Deu pra ler o arquivo nãum, tíu';
		}
		return response.end(resul+'');
	}
	return response.end('Foda-se.');
}

function htmlDecode(value){
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&colon;/g, ':')
        .replace(/&amp;/g, '&');
}

function getSSResponse(par, response) {
	if (par.msg)
		par.msg = htmlDecode(decodeURIComponent(par.msg));
	
	var msg = encodeURIComponent(par.msg || ''), 
		lang = {nc : par.lang? par.lang :'pt'},
		time = new Date(new Date().getTime()+60e5),
		options = {
			gzip: true,
			headers: {
				Accept:'application/json, text/javascript, */*; q=0.01',
				'Accept-Language':'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
				Connection:'keep-alive',
				'Content-Type':'application/json; charset=utf-8',
				cookie : '_ga=GA1.2.555575991.'+Math.round(time/1e3)+'; _gat=1',
				Host:'www.simsimi.com',
				Referer:'http://www.simsimi.com/',
				'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36',
				'X-Requested-With':'XMLHttpRequest'
			}
		};
	
	request('http://www.simsimi.com/requestChat?lc='+lang.nc+'&ft=0.0&req=' + msg, options, function (error, res, body) {
		if (!error){
			msgc++;
			var resp='';
			try{				
				resp = JSON.parse(body);
				resp.cun = par.cun || '';
				resp.cuid = par.cuid || '';
				resp.lang = lang;
				resp.resp = resp.res.msg.replace(/<\/?[^>]+(>|$)/g, "");
				resp.lng = lang.nc;
				
				if (resp.resp=='I HAVE NO RESPONSE.PLEASE TEACH ME.Android: simsimi.com/app/androidiOS: simsimi.com/app/iOS'){
					resp.msg_err = resp.resp;
					resp.resp='[Erro] SimSimi não possui resposta para a sua mensagem.';
				}				
				delete resp.res;
								
				resp = JSON.stringify(resp);
				fs.appendFile('main.log', 'SimSimi '+getStatus() + '\n' + par.msg + '\n' + resp
						+ '\n\n');
				
			}catch(e){
				console.log(e);
			}			
			response.end(resp);
		}else{
			var error = JSON.stringify({
				"error" : e.message
			});
			fs.appendFile('main.log', 'SimSimi '+getStatus() + '\n' + msg + '\n' + error
					+ '\n\n');
			response.end(error);
		}
	});		
}
function getEdResponse(par, response){
	if (par.msg)
		par.msg = htmlDecode(decodeURIComponent(par.msg));
	
	var msg = encodeURIComponent(par.msg || ''), 
		options = {gzip: true};
		
	request('http://www.ed.conpet.gov.br/mod_perl/bot_gateway.cgi?server=0.0.0.0%3A8085&charset_post=utf-8&charset=utf-8&pure=1&js=0&tst=1&msg='
					+ msg, options, function (error, res, body) {
		if (!error){
			var resp = body.replace(/<\/?[^>]+(>|$)/g, "");
			resp = JSON.stringify({
				resp:resp,
				lng:'pt',
				cun:par.cun || '',
				cuid:par.cuid || ''
			});
			msgc++;
			
			try{				
				fs.appendFile('main.log', 'Ed'+getStatus() + '\n' + par.msg + '\n' + resp + '\n\n');
			}catch(e){}
			
			response.end(resp);
		}else{
			var error = JSON.stringify({
				"error" : e.message
			});
			fs.appendFile('main.log', 'Ed'+getStatus() + '\n' + par.msg + '\n' + error
					+ '\n\n');
			response.end(error);
		}
	});
}

function parseRequest(request, response, data){
	switch (data.bot) {
		case 'ss':
			return getSSResponse(data, response);
		case 'admin':
			return adminPanel(data, request, response);
		case 'ed':
			return getEdResponse(data, response);
		default: {
			response.end(JSON.stringify({
				"error" : "Opção inválida"
			}));
		}
	}
}

var server = http.createServer(function(request, response) {
		response
			.writeHead(
					200,
					{
						"Access-Control-Allow-Origin" : 'https://stg.plug.dj',
						"Access-Control-Allow-Credentials" : "true",
						"Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
					});
	if (request.method == 'POST') {
		var body = '';
		request.on('data', function(data) {
			body += data;
		});
		request.on('end', function() {
			var POST = {};
			try {
				POST = qs.parse(body);
			} catch (e) {
			}
			parseRequest(request, response, POST);			
		});
	} else if (request.method == 'GET') {
		var url_parts = {};
		try {
			url_parts = url.parse(request.url, true).query;
		} catch (e) {
		}		
		parseRequest(request, response, url_parts);	
	}
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 9876;
var address = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
server.listen(port, address);
