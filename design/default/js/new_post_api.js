$( document ).ready(function() {

        $('[name=new_post_sender_city]').change(function(){
          if($('[name=new_post_key]').val().length == 0){
              alert('Введите сначала ключ api');
              $('[name=new_post_sender_city]').val( $('[name=new_post_sender_city] option:eq(0)').val());
          }
          $.ajax({
              url: "/simpla/ajax/new_post_get_ware_house.php",
              data: {city: $('[name=new_post_sender_city]').val(), key: $('[name=new_post_key]').val()},
              dataType: 'json',
              success: function(data){
                  if(data.error){
                    alert(data.error);
                      return false;
                  }
                  if(data.success =='false'){
                      alert('Bad request');
                      return false;
                  }
                  var option_list = '';
                  for(var i=0; i<data.data.length;i++)
                  {
                      option_list = option_list + ' <option  value="'+data.data[i].Ref+'">'+data.data[i].DescriptionRu+'</option>';
                  }
                  $('[name=new_post_ware_house]').html(option_list);
              }
          });
          return false;
      });

    $('[name=new_post_recipient_city]').change(function(){
        $.ajax({
            url: "/ajax/new_post_get_ware_house.php",
            data: {city: $('[value="'+$('[name=new_post_recipient_city]').val()+'"]').attr('ref'), key: $('[name=new_post_key]').val()},
            dataType: 'json',
            success: function(data){
//                if(data.error){
//                    alert(data.error);
//                    return false;
//                }
                if(data.success =='false'){
                    alert('Bad request');
                    return false;
                }
                var option_list = '';
                for(var i=0; i<data.data.length;i++)
                {
//Проверяет вес заказа
                    if(data.data[i].TotalMaxWeightAllowed >= parseInt($('.order_weight').attr('weight')) || data.data[i].TotalMaxWeightAllowed==null)
                    {
                        option_list = option_list + ' <option  value="'+data.data[i].DescriptionRu+'">'+data.data[i].DescriptionRu+'</option>';
                     //   console.log(data.data[i].TotalMaxWeightAllowed  + '  ' + data.data[i].DescriptionRu+'   weight '+ $('.order_weight').attr('weight'));
                    }
                }
                $('[name=new_post_recipient_ware_house]').html(option_list);
            }
        });

        return false;
    });


      $('[name=new_post_key]').change(function(){
          if($('[name=new_post_key]').val().length == 0){
              alert('Введите сначала ключ api');
              $('[name=new_post_sender_city]').val( $('[name=new_post_sender_city] option:eq(0)').val());
          }
          $.ajax({
              url: "/simpla/ajax/new_post_get_sender_city.php",
              data: {key: $('[name=new_post_key]').val()},
              dataType: 'json',
              success: function(data){
                  if(data.error){
                    alert(data.error);
                      return false;
                  }
                  if(data.success =='false'){
                      alert('Bad request');
                      return false;
                  }
                  var option_list = '';
                  for(var i=0; i<data.data.length;i++)
                  {
                      option_list = option_list + ' <option value="'+data.data[i].Ref+'">'+data.data[i].DescriptionRu+'</option>';
                  }
                  $('[name=new_post_sender_city]').html(option_list);
              }
          });
          return false;
      });

    $('[name=delivery_id]').change(function(){
        if($(this).val()==999999)
        {
            $('.block_adress').show();
        }else
        {
            $('.block_adress').hide();
        }
    });

    $('.add_en').click(function()
    {
        if($('[name=new_post_last_name]').val()=='' || $('[name=new_post_name]').val()=='' || $('[name=new_post_midle_name]').val()=='')
        {
            $.fancybox({ content: '<br/><div><h2>Не заполнены контактные данные получателя.</h2><br/><div>',helpers: {overlay:{locked: false}}});
            return false;
        }
        $.fancybox({ content: '<br/><div><h2>Документ создается</h2><br/><div>',helpers: {overlay:{locked: false}}});
        var weight = 1;
        if($('[name=new_post_custom_weight]').val()=='')
        {
            weight = $('[name=new_post_default_weight]').val();
        }else
        {
            weight = $('[name=new_post_custom_weight]').val();
        }
        var post_string = $('form [name=new_post_last_name], form [name=new_post_name], form [name=new_post_midle_name], [name=new_post_recipient_ware_house],[name=new_post_recipient_city]').serialize();

        $.ajax({
            url: "/simpla/ajax/new_post_generate_en.php?"+ post_string,
            data: {order_id: $('.add_en').attr('id_orders'),weight:weight},
            dataType: 'json',
            success: function(data){
                if(data.success==false){
                    console.log(data.errors);
                    var error_text='<h1>Ошибка генерации!</h1><br><ul class="error_new_post">';
                    if(data.errors.RecipientAddress)
                    {
                        error_text += "<li>Проблемы с выбором адреса получателя</li>";
                    }
                    if(data.errors.Weight =='Warehouse place max allowed weight: 30')
                    {
                        error_text += "<li>Вес на одно место не больше 30</li>";
                    }
                    if(data.errors.RecipientsPhone =='RecipientsPhone invalid format')
                    {
                        error_text += "<li>Не корректный номер получателя (пример +380*********)<br>Исправьте номер получателя, сохраните заказ и попробуйте снова.</li>";
                    }
                    $.fancybox({ content: error_text + '</ul>'});
                    var curPos=$(document).scrollTop();
                    var scrollTime=curPos/1.73;
                    $("body,html").animate({"scrollTop":$('#order_details').scrollTop()},scrollTime);
                    return false;
                }
                if(data.success==true){
//                    var data_req = data;
//                    console.log(data_req.data[0].IntDocNumber);
                    $('[name=new_post_recipient_city_old]').val($('[name=new_post_recipient_city]').val());
                    $('[name=new_post_ware_house_old]').val($('[name=new_post_recipient_ware_house]').val());
                    $('.new_post_remove').remove();
                    $('[name=new_post_recipient_city]').parent().before('<li class="reci_d new_post_remove"><div class="add_en_number"><label>Накладная:</label><span><b><a target="_blank" href="https://my.novaposhta.ua/orders/index/OrderField/DateTime/OrderDirection/DESC">' + data.data[0].IntDocNumber + '</a></b></span><input name="new_post_document_id" value="'+data.data[0].IntDocNumber+'" type="hidden"></div></li>');
                    $('[name=new_post_recipient_city]').parent().before('<li class="reci_d new_post_remove"><div class="add_en_cost"><label>Цена:</label> <span><b>' + data.data[0].CostOnSite + ' грн.</b></span><input name="new_post_cost_delivery" value="'+data.data[0].CostOnSite+'" type="hidden"></div></li>');
                    $('[name=new_post_recipient_city]').parent().before('<li class="reci_d new_post_remove"><div class="add_en_data"><label>Дата:</label> <span><b>' + data.data[0].EstimatedDeliveryDate + '</b></span><input name="new_post_date_delivery" value="'+data.data[0].EstimatedDeliveryDate+'" type="hidden"></div></li>');
                    $.fancybox({ content: '<div><h2>Электронная накладная сформирована</h2><br/><div>'+ 'Сгенирировано Номер ЭН: <a target="_blank" href="https://my.novaposhta.ua/orders/index/OrderField/DateTime/OrderDirection/DESC"><b>'  + data.data[0].IntDocNumber + '</b></a></div></div>',helpers: {overlay:{locked: false}}});


                    return false;
                }

            }
        });
    });


    $('.oreder_new_post [name=new_post_recipient_ware_house]').change(function(){
        $('.button_green.button_save').click();
    })

});