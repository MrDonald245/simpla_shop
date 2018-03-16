<?php
	session_start();
    require_once('../../api/Simpla.php');
    $simpla = new Simpla();
    $key_sender = $simpla->settings->new_post_key;
    $order_id = $simpla->request->get('order_id', 'string');
    $city_sender = $simpla->settings->new_post_sender_city;
    $ware_house_sender = $simpla->settings->new_post_ware_house;

    $recipient_name = $simpla->request->get('new_post_name', 'string');
    $recipient_last_name = $simpla->request->get('new_post_last_name', 'string');
    $recipient_middle_name = $simpla->request->get('new_post_midle_name', 'string');


    $new_post_recipient_city = $simpla->request->get('new_post_recipient_city');
    $new_post_recipient_ware_house = $simpla->request->get('new_post_recipient_ware_house');

    if($new_post_recipient_city =='' || $new_post_recipient_ware_house=='')
    {

        print(json_encode(array('success'=>false,"errors"=>array('error_custom'=>'Recipient city and warehouse not correct. Enter correct value.'))));
        die();
    }

    //$simpla->orders->update_order($order_id,array('new_post_recipient_city'=>$new_post_recipient_city, 'new_post_recipient_ware_house'=>$new_post_recipient_ware_house));

    if($recipient_name =='' || $recipient_last_name=='' || $recipient_middle_name=='')
    {
        print(json_encode(array('error'=>'Recipient data not correct. Enter correct value.')));
        die();
    }
    if($recipient_name =='' && $recipient_last_name=='' && $recipient_middle_name=='')
    {
        print(json_encode(array('success'=>false,"errors"=>array('error_custom'=>'Recipient data not correct. Enter correct value.'))));
        die();
    }
    if($city_sender=='')
    {
        print(json_encode(array('error'=>'Not find ref city')));
        die();
    }

    if($key_sender=='' && $simpla->settings->new_post_key=='')
    {
        print(json_encode(array('error'=>'Key is empty')));
        die();
    }

    require_once('../../api/NovaPoshtaApi2.php');
    /*Новая почта*/
    $np = new NovaPoshtaApi2($key_sender);


$weight =(float) $simpla->request->get('weight', 'float');
$order = $simpla->orders->get_order((int)$order_id);
if($weight==''){
    if($simpla->settings->new_post_weight!='')
        $weight = $simpla->settings->new_post_weight;
    else
        $weight = 1;
}

$purchase = $simpla->orders->get_purchases(array('order_id'=>$order_id));
$description = 'Товары';
$count=0;
foreach($purchase as $purc){
    //$description .= " ".$purc->product_name.', ';
    $count +=$purc->amount;
}

if($order->phone=='')
{
    print(json_encode(array('success'=>false,"errors"=>array('error_custom'=>'Recipient phone not correct. Enter correct value.'))));
    die();
}

$order->phone = str_replace(' ','',$order->phone);
$order->phone = str_replace('-','',$order->phone);
$order->phone = str_replace('(','',$order->phone);
$order->phone = str_replace(')','',$order->phone);
$order->phone = str_replace('+38','',$order->phone);

// Перед генерированием ЭН необходимо получить данные отправителя
// Получение всех отправителей
$senderInfo = $np->getCounterparties('Sender', 1, '', '');

// Выбор отправителя в конкретном городе (в данном случае - в первом попавшемся)
$sender = $senderInfo['data'][0];
// Информация о складе отправителя
$senderWarehouses = $np->getWarehouses($sender['City']);
// Генерирование новой накладной

if($simpla->request->get('new_post_recipient_city', 'string'))
{
    $order->new_post_recipient_city = $simpla->request->get('new_post_recipient_city', 'string');
}

if($simpla->request->get('new_post_recipient_ware_house', 'string'))
{
    $order->new_post_recipient_ware_house = $simpla->request->get('new_post_recipient_ware_house', 'string');
}

//$arr_cities = $np->getCities(0,$order->new_post_recipient_city);
$arr_cities = $np->getCities(0,$new_post_recipient_city);
foreach($arr_cities['data'] as $city){
    if(trim($city['DescriptionRu'])==trim($order->new_post_recipient_city)){
        $arr_cities =  $city['Ref'];
        break;
    }
}
    //$RecipientAddress = $np->getWarehouse($arr_cities, $order->new_post_recipient_ware_house);
$RecipientAddress = $np->getWarehouse($arr_cities, $new_post_recipient_ware_house);
if($sender['FirstName']=='' && $sender['MiddleName']=='' && $sender['LastName']=='')
{
    $sender_desc =  explode(' ',$sender['Description']);
    $sender['FirstName'] = $sender_desc[1];
    $sender['MiddleName'] =$sender_desc[2];
    $sender['LastName'] = $sender_desc[0];

}
$sender_options = array(
    // Данные пользователя
    'FirstName' => $sender['FirstName'],
    'MiddleName' => $sender['MiddleName'],
    'LastName' => $sender['LastName'],

    'CitySender' => $sender['City'],
    // Отделение отправления по ID (в данном случае - в первом попавшемся)
    'SenderAddress' => $senderWarehouses['data'][0]['Ref'],

);
if($simpla->settings->new_post_phone_sender!=''){
    $sender_options['Phone'] = $simpla->settings->new_post_phone_sender;
}

$result = $np->newInternetDocument(
// Данные отправителя
    $sender_options
    ,
    // Данные получателя
    array(
        'FirstName' => $recipient_name,
        'MiddleName' => $recipient_middle_name,
        'LastName' => $recipient_last_name,
        'Phone' => $order->phone,
        'CityRecipient' => $arr_cities,
//        'City' => 'Комсомольск',
//        'Region' => 'Комсомольск',
        'Warehouse' =>$new_post_recipient_ware_house,
        "CounterpartyType"=> "PrivatePerson",
        'RecipientAddress' =>$RecipientAddress["data"][0]['Ref'],
    ),
    array(
        // Дата отправления
        'DateTime' => date('d.m.Y'),
        // Тип доставки, дополнительно - getServiceTypes()
        'ServiceType' => 'WarehouseWarehouse',
        // Тип оплаты, дополнительно - getPaymentForms()
        'PaymentMethod' => $simpla->settings->new_post_type_pay,
        // Кто оплачивает за доставку
        'PayerType' => $simpla->settings->new_post_pay,
        // Стоимость груза в грн
        'Cost' => $order->total_price,
        // Кол-во мест
        'SeatsAmount' => $count,
        // Описание груза
        'Description' => 'Товар',
        // Тип доставки, дополнительно - getCargoTypes
        'CargoType' => 'Cargo',
        // Вес груза
        'Weight' => $weight,
        // Объем груза в куб.м.
       // 'VolumeGeneral' => '0.1',

    )
);


if($result['success']==true)
{

$simpla->orders->update_order($order_id,array('new_post_document_id'=>$result['data'][0]['IntDocNumber'], 'new_post_cost_delivery'=>$result['data'][0]['CostOnSite'],
    'new_post_date_delivery'=>$result['data'][0]['EstimatedDeliveryDate'],
    'new_post_name'=>$recipient_name, 'new_post_midle_name'=>$recipient_middle_name, 'new_post_last_name'=>$recipient_last_name,
    'new_post_custom_weight'=>$weight,
    'new_post_recipient_city'=>$new_post_recipient_city, 'new_post_recipient_ware_house'=>$new_post_recipient_ware_house));

}
print json_encode($result);
