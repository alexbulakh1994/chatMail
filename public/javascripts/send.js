var $form = $('#createMessage');
var $sendMesage = $('#messageSend');
var closeItem = $("span[id*='close']");

	
	$form.submit(function(event) {
		$('#newMessage').modal('show');
		return false;
	}); 

	$sendMesage.submit(function(event) {
		var mailText = $('#mailText').val();
		var email = $('#email').val();
		var subject = $('#subject').val();

		var socket = io.connect('http://localhost:8080/new');
	  socket.emit('new', { subject: subject, mailText: mailText, email: email});
	  socket.on('render', function(data) {
	  	window.location.href = '/user/profile';
	  });
	  $('#newMessage').modal('hide');
		return false;
	});

	closeItem.click(function() {  	
    var socket = io.connect('http://localhost:8080/delete');
    socket.emit('delete', {id: $(this).attr('iddata')});

    this.parentNode.parentNode.parentNode.parentNode.parentNode
    		.removeChild(this.parentNode.parentNode.parentNode.parentNode);
		
    return false;
  });



