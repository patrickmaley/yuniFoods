// this is your code
$(function(){ // wait for page to load
  
  // this is your selector
  $('input.this-is-your-class').MultiFile({
    // your options go here
    
    accept: 'jpg|png|gif'
  });

});

$(function() { // wait for document to load 
  $('#T7').MultiFile({
    list: '#T7-list'
  });
});