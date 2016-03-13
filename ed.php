<?PHP
header("Access-Control-Allow-Origin: https://stg.plug.dj");
header("Access-Control-Allow-Credentials: true ");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, 
    X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");

function ed($msg) {
	 $curl = curl_init(); if (!$curl) exit;
	 $url = 'http://www.ed.conpet.gov.br/mod_perl/bot_gateway.cgi?server=0.0.0.0%3A8085&charset_post=utf-8&charset=utf-8&pure=1&js=0&tst=1&msg=' . $msg;
	 curl_setopt($curl, CURLOPT_URL, $url);
	 curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	 return curl_exec($curl);
}

$msg = (empty($_POST['msg']) ? $_GET['msg'] : $_POST['msg']);

echo ed($msg);
?>
