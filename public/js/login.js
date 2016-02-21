$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

var model = {
    username: '',
    password: '',
};

var app = new Vue({
    el: '#login',
    data: model,
    methods: {
        loginUser: function() {
            if (!app.username && !app.password)
                alert('Please enter username and password!');

            $.ajax({
                method: "POST",
                url: "/login",
                data: { email: app.username, password: app.password }
            }).done(function( msg ) {
                alert( "Data Saved: " + msg );
            }).error(function(xhr, ajaxOptions, thrownError) {
                alert(thrownError);
            });
        }
    }
});
