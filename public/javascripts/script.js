<!-- Creates a modal when a picture is clicked-->

    $('.pop').on('click', function() {
        $('.imagepreview').attr('src', $(this).find('img').attr('src'));
        $('#imagemodal').modal('show');   
    });


    $(':file').on('fileselect', function(event, numFiles, label) {
        console.log(numFiles);
        console.log(label);
    });