<?php
const API_CACHE_LIFETIME = '+1 week';
  function url(){
    return sprintf(
      "%s://%s%s",
      ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') || (isset($_SERVER['HTTP_X_SCHEME']) && $_SERVER['HTTP_X_SCHEME'] == 'https')) ? 'https' : 'http',
      $_SERVER['HTTP_HOST'],
      preg_replace( '/\/(htdocs|www)/', '', dirname($_SERVER['SCRIPT_NAME']) )
    );
  }

function api($method, $fields = array(), $post = 0) {
    $cachePath = __DIR__ . '/assets/' . md5($method . implode('', $fields) . $post) . '.json';
    if (file_exists($cachePath) && (filectime($cachePath) + strtotime(API_CACHE_LIFETIME) > time())) {
        return json_decode(file_get_contents($cachePath));
    }
    if (file_exists(__DIR__ . '/api/index-api.php')) {
        /** @var \yii\web\Application $yiiApp */
        $yiiApp = require __DIR__ . '/api/index-api.php';
        $_SESSION['__REQUEST_URI__'] = '/api/v1' . $method;
        $response = $yiiApp->runAction('/v1' . $method, $fields);
        if (!$response['data']) {
            $response['data'] = $response;
        }
        $data = json_encode($response);
        file_put_contents($cachePath, $data);
        return json_decode($data);
    }
    $url = base_url("/api/v1" . $method);
    $fields_string = http_build_query($fields);

    //open connection
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, $post);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    // curl_setopt($ch, CURLOPT_USERPWD, "login:password");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($ch, CURLOPT_HEADER, 0);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
      var_dump(curl_error($ch));
    }
    curl_close($ch);

    file_put_contents($cachePath, $response);
    return json_decode($response);
  }

  function isVK(){
    return testUserAgent('vkShare'); // Mozilla/5.0 (compatible; vkShare; +http://vk.com/dev/Share)
  }
  function isOK(){
    return testUserAgent('OdklBot|odnoklassniki.ru'); // Mozilla/5.0 (compatible; OdklBot/1.0 like Linux; klass@odnoklassniki.ru)
  }
  function isFB(){
    return testUserAgent('facebookexternalhit'); // facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)
  }
  function isTwitter(){
    return testUserAgent('Twitterbot') && !isTg(); // Twitterbot/1.0
  }
  function isTg(){
    return testUserAgent('TelegramBot'); // TelegramBot (like TwitterBot)
  }
  function isWhatsApp(){
    return testUserAgent('WhatsApp'); // WhatsApp/2.19.258 A
  }
  function isViber(){
    return testUserAgent('Viber'); // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.6.0 Chrome/45.0.2454.101 Safari/537.36 Viber
  }
  function testUserAgent($str) {
    return stripos($_SERVER['HTTP_USER_AGENT'], $str) !== FALSE;
  }

  function request_url() {
    return sprintf(
      "%s://%s%s",
      ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') || (isset($_SERVER['HTTP_X_SCHEME']) && $_SERVER['HTTP_X_SCHEME'] == 'https')) ? 'https' : 'http',
        $_SERVER['HTTP_HOST'],
      htmlspecialchars($_SERVER['REQUEST_URI'])
    );
  }
  function base_url($val) {
    return url() . $val;
  }

  function getShare(){
    $result = new stdClass();
    $result->title = 'Заголовок';
    $result->description = 'Описание';
    $version = "?0.0.1";
    $result->image = array(
      'fb' => base_url("images/share/base.png" . $version),
      'ok' => base_url("images/share/base.png" . $version),
      'tw' => base_url("images/share/base.png" . $version),
      'vk' => base_url("images/share/vk.png" . $version)
    );
    $result->canonical_url = request_url();

  	// Проверка _GET параметров и подмена текста и картинок

    if (isVK() || isViber()) {
      $result->title = $result->title . ' ' . $result->description;
    }
    return $result;
  }

  function className($list) {
    $result = array();
    foreach($list as $key => $value) {
      if ($value) {
        array_push($result, $key);
      }
    }
    return implode(" ", $result);
  }

  $share = getShare();
?>
