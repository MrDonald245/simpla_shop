<?php
	session_start();
    require_once('../../api/Simpla.php');
    $simpla = new Simpla();
    $key = $simpla->request->get('key', 'string');

    if($key=='')
    {
        print(json_encode(array('error'=>'Key is empty')));
        die();
    }

    require_once('../../api/NovaPoshtaApi2.php');
    /*Новая почта*/
    $np = new NovaPoshtaApi2($key,
        'ru', // Язык возвращаемых данных: ru (default) | ua | en
        FALSE, // При ошибке в запросе выбрасывать Exception: FALSE (default) | TRUE
        'curl' // Используемый механизм запроса: curl (defalut) | file_get_content
    );

   	print json_encode( $np->getCities());
