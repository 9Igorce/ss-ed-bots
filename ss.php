<?PHP
header("Access-Control-Allow-Origin: https://plug.dj");

function simsimi($tresc, $sid, $uid, $data) {
	/* auth */
	for ($i = 0; $i < 5; $i++){
		if ( !$id || !$sid ){
			$ch = curl_init('http://www.simsimi.com/func/register');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_HEADER, 1);
			$result = curl_exec($ch);

			$sidaux = substr($result, stripos($result, 'Set-Cookie: ')+16);
			$sid = substr($sidaux, 0, stripos($sidaux, ';'));			
			
			 $idjson = substr($result, stripos($result, '{"uid":'));
			 
			 $obj = json_decode($idjson);
			 $id = $obj->{'uid'};
		 }
		 if ( $id ){
			break;
		 }
	 }
	 /* msg */
	 
	 if ( !$data )
		$data = date('U');
	 
	 $curl = curl_init(); if (!$curl) exit;
	 $headers = array(
	   'Accept: application/json, text/javascript, */*; q=0.01',
	   'Content-type: application/json; charset=utf-8',
	   'Referer: http://www.simsimi.com/talk.htm',
	   'User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; pl; rv:1.9.2.13) Gecko/20101203 Firefox/3.5.13',
	   'Cookie: sid='.$sid.'; AWSELB=BF8D19F26622D89F6936CA1E73D2A1C3FB17942847373FED5B1042678F453AEF915A2A4FA58CE0EE151EB3898667781E2C3E6DFD1F4741ABBB966B98FDE0204A4ED81852; Filtering=0.0; Filtering=0.0; __utmt=1; isFirst=1; isFirst=1; simsimi_uid=' .$id.'; simsimi_uid=' .$id. '; selected_nc_name=Portugu%EAs; selected_nc_name=Portugu%EAs; selected_nc=pt; selected_nc=pt; __utma=119922954.1356838155.'.$data.'.'.$data.'.'.$data.'.1; __utmb=119922954.3.9.'.($data*1000+15000).'; __utmc=119922954; __utmz=119922954.'.$data.'.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',
	   'X-Requested-With: XMLHttpRequest'
	 );
	 
	 $url = 'http://www.simsimi.com/func/reqN?lc=pt&ft=0.0&req='.$tresc.'&fl=http%3A%2F%2Fwww.simsimi.com%2Ftalk.htm';
	 curl_setopt($curl, CURLOPT_URL, $url);
	 curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
	 curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	 return '{"uid" : '.(!$id ? 0 : $id ).', "sid" : "'.(!$sid ? '' : $sid ).'", "url" : "' . $url . '", "data" : ' . curl_exec($curl) . '}';
}

$uid = (empty($_POST['uid']) ? $_GET['uid'] : $_POST['uid']);
$sid = (empty($_POST['sid']) ? $_GET['sid'] : $_POST['sid']);
$data = (empty($_POST['data']) ? $_GET['data'] : $_POST['data']);
$resul = (empty($_POST['msg']) ? $_GET['msg'] : $_POST['msg']);

echo simsimi($resul, $sid, $uid, $data);
?>
