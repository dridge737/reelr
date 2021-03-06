var json = '';
var preview = false;
var target = "/var/www/media/Movies/";
var currentMovie = 0;

$(document).ready(function() {
  $.ajax({
    type:   "POST",
    url:    "../scripts/loadMovies.php",
    data:   {
        directory:  target
    },
    success: function(data) {
      $('#loading').hide();
      
      if(data.indexOf("Error") > -1){
        $('#movie-wrapper').append('<p class="text-danger message"><br><br><br>'+data.replace('Error', '')+'</p>');
      }
      else{
        console.log("success");
        json = $.parseJSON(data);
        for(var i=0; i<json.length; i++){
          console.log(json[i]);
          $("#movie-wrapper").append('<div class="movie" id="movie'+i+'"><div class="poster-container"><img class="poster" id="poster'+i+'" src=""></div><div class="info" align=center id="info'+i+'"><p id="title'+i+'"></p><p id="date'+i+'"></p></div></div>');

          $('#poster'+i).attr('src', json[i].poster);
          
          if(json[i].title.length == 0)
            $('#title'+i).text(json[i].path.replace(target, ''));
          else
            $('#title'+i).text(json[i].title);
          
          $('#date'+i).text(json[i].year);
        }
        $("#movie-count").text(" ("+json.length+")");
      }
    }
  });
});

$(document).on('click', '.movie', function () {
  var start = 0;
  var end = 0;
  currentMovie = parseInt($(this).attr('id').replace('movie', ''));

  $( '.movie' ).removeClass('selected');

  $( '.movie' ).each(function( index ) {
    if($('#movie'+(index+1)).length){
      if( $('#movie'+index).offset().top != $('#movie'+(index+1)).offset().top ){
        start = end;
        end = index+1;
        $( '.movie' ).slice(start, index+1).wrapAll("<div class='row-wrapper' style='display:block;overflow:hidden;'></div>");
      }
    }
  });
  $( '.movie' ).slice(end).wrapAll("<div class='row-wrapper' style='display:block;overflow:hidden;'></div>");

  if(!preview){
    $(this).addClass('selected');
    $(this).parent().after("<div id='preview'><div class='preview-header'><h4>"+json[currentMovie].title+"</h4><hr noshade style='width:100%;height:0.5px;color:#FFF;'><h6>"+json[currentMovie].director+"</h6><br><p>"+json[currentMovie].plot+"</p><br><a href='javascript:void(0)' id='play' class='btn btn-primary'>Play</a><a href='"+json[currentMovie].path.replace(target, '/media/Movies/')+"' id='download' class='btn btn-success'>Download</a></div><div class='poster-container' style='padding-top:1.5%;'><img class='poster-big' src='"+json[currentMovie].poster+"'></div></div>");
    $('#preview').hide();

    $( "#preview" ).animate({
        down: "-=50",
        height: "toggle"
    }, {duration: 750, queue: false,complete: function() {}
    });
    preview = true;
  }
  else{
    $( "#preview" ).animate({
        up: "+=75",
        height: "toggle"
    }, {duration: 500, queue: false,complete: function() {$('#preview').remove(); $( '.movie' ).unwrap();}
    });
    preview = false;
  }

});

$(document).on('click', '#play', function () {
  $('#title').val(json[currentMovie].path);
  $('#invisible_form').submit();
});

$(document).on('keypress', '#search-bar', function (event) {
    if (event.which == 13) {
      event.preventDefault();
      var search = $("#search-bar").val();

      $('.movie').remove();
      $('#loading').show();

      $.ajax({
        type:   "POST",
        url:    "../scripts/search.php",
        data:   {
            query:  search
        },
        success: function(data) {
          $('#loading').hide();
          
          if(data.indexOf("Error") > -1){
            $('#movie-wrapper').append('<p class="text-danger message"><br><br><br>'+data.replace('Error', '')+'</p>');
          }
          else{
            console.log("success");
            json = $.parseJSON(data);
            for(var i=0; i<json.length; i++){
              console.log(json[i]);
              $("#movie-wrapper").append('<div class="movie" id="movie'+i+'"><div class="poster-container"><img class="poster" id="poster'+i+'" src=""></div><div class="info" align=center id="info'+i+'"><p id="title'+i+'"></p><p id="date'+i+'"></p></div></div>');

              $('#poster'+i).attr('src', json[i].poster);
              
              if(json[i].title.length == 0)
                $('#title'+i).text(json[i].path.replace(target, ''));
              else
                $('#title'+i).text(json[i].title);
              
              $('#date'+i).text(json[i].year);
            }
            $("#movie-count").text(" ("+json.length+")");
          }
        }
      });
    }
});

$(document).on('click', '#upload-button', function () {
  var reader;
  var progress = document.querySelector('.percent');

  function abortRead() {
    reader.abort();
  }

  function errorHandler(evt) {
    switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        alert('File Not Found!');
        break;
      case evt.target.error.NOT_READABLE_ERR:
        alert('File is not readable');
        break;
      case evt.target.error.ABORT_ERR:
        break; // noop
      default:
        alert('An error occurred reading this file.');
    };
  }

  function updateProgress(evt) {
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      // Increase the progress bar length.
      if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
      }
    }
  }

  function handleFileSelect(evt) {
    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout("document.getElementById('progress_bar').className='';", 2000);
    }

    // Read in the image file as a binary string.
    reader.readAsBinaryString(evt.target.files[0]);
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
});