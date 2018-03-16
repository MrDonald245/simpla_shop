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

 });