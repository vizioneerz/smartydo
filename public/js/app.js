$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

var model = {
    showSuggestions: false,
	todoinput: {
		content: '',
		time: '',
		date: '',
        location: null,
        weather: '',
		movie: '',
		tv: '',
		school: '',
		book: '',
        url: '',
        opened: false,
	},
	todos: [
	],
	placeholders: [
		'Pick up package at store',
		'Water garden at 3pm tomorrow',
		'Dinner at Little Tokyo with Yanique Robinson',
		'Cancel Netflix subscription',
		'Cancel Gym Membership next month',
		'Go to supermarket this week Friday',
		'Watch Narcos tonight at 8',
	],
    suggestions: [],
    locationModalSearch: '',
    locationModalResults: [],
    user_location: {},
    curTodo: {},
    bookModalResults: [],
    bookModalSearch: '',
    videoModalResults: [],
    videoModalSearch: '',
};


///////////////////////////////
// Components
//
var ToDoItem = Vue.extend({
	props: ['todo'],
	template: '<a class="list-group-item todo" href="#" v-on:click.stop="openTodo(todo, $event)" v-bind:class="classObject">' +
					'<input type="checkbox" v-model="todo.completed" v-on:click.stop="markTodoCompleted(todo)">' +
                    ' <span class="badge delete" v-if="todo.time" v-on:click.stop="deleteTodo(todo)">DELETE</span>' +
                    '{{ todo.content }}' +
                    '<img src="./img/overdue.png" v-if="showOverdue" class="status" />' +
                    '<div class="details" v-on:click.stop>' +

                        '<div class="tags">' +
                            '<span class="label label-primary" v-if="todo.time">TIME: {{ timeFormatted }}</span>' +
                            '<span class="label label-success" v-if="todo.date">DATE: {{ todo.date }}</span>' +
                            '<span class="label label-warning" v-if="todo.location">LOCATION: {{ todo.location.name }}</span>' +
                            '<span class="label label-info" v-if="todo.book">BOOK: {{ todo.book.title }}</span>' +
                            '<span class="label label-danger" v-if="todo.movie">MOVIE: {{ todo.movie }}</span>' +
                            '<span class="label label-warning" v-if="todo.tv">TV: {{ todo.tv }}</span>' +
                        '</div>' +

                        '<div v-if="todo.book" style="margin-top:20px;">' +
                            '<div class="row">' +
                                '<div class="col-sm-3">' +
                                    '<img v-bind:src="todo.book.image" v-if="todo.book.image" style="float:left;width:100%;height:auto;margin-right:15px;" />' +
                                    '<img v-bind:src="http://penguinrandomhouse.ca/sites/default/files/default-book.png" v-if="!todo.book.image" style="float:left;width:100%;height:auto;margin-right:15px;" />' +
                                 '</div>' +
                                '<div class="col-sm-9">' +
                                    '<h4 v-bind:url="todo.book.url">{{ todo.book.title }}</h4> ' +
                                     '<p style="max-height:115px;overflow:hidden;">{{ todo.book.description }}</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div v-if="todo.video" style="margin-top:20px;">' +
                            '<div class="row">' +
                                '<div class="col-sm-3">' +
                                    '<img v-bind:src="todo.video.image" v-if="todo.video.image" style="float:left;width:100%;height:auto;margin-right:15px;" />' +
                                    '<img v-bind:src="http://www.movli.com/images/movie-default.jpg" v-if="!todo.video.image" style="float:left;width:100%;height:auto;margin-right:15px;" />' +
                                 '</div>' +
                                '<div class="col-sm-9">' +
                                    '<h4 v-bind:url="todo.video.url">{{ todo.video.title }}</h4> ' +
                                     '<p style="max-height:115px;overflow:hidden;">{{ todo.video.overview }}</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
			'</a>',
      computed: {
        timeFormatted: function () {
          if (!this.todo.time)
            return this.todo.time;

          var time = moment(this.todo.time, "HH:mm:ss");
          var formatted = time.format("h:mm a");

          return formatted;
      },
        dateTime: function () {
          if (!this.todo.time)
            return this.todo.time;
          if (!this.todo.date)
            return this.todo.date;

          var datetime = moment(this.todo.date + ' ' + this.todo.time, "YYYY-MM-DD HH:mm:ss");

          var formatted = datetime.format("YYYY-MM-DD HH:mm:ss");

          return formatted;
      },
        showOverdue: function() {
              if (!this.todo.time)
                return false;
              if (!this.todo.date)
                return false;
              if (this.todo.completed)
                return false;

              var datetime = moment(this.todo.date + ' ' + this.todo.time, "YYYY-MM-DD HH:mm:ss");

              var result = moment(datetime).isBefore(moment());

              return result;
        },
        classObject: function() {
            return {
                "completed": this.todo.completed
            }
        }
    },
    methods: {
        markTodoCompleted: function(todo, e) {
            todo.completed = todo.completed ? 0 : 1;

            $.ajax({
                method: "PUT",
                url: "/todos/" + todo.id,
                data: { 'todo': todo },
            }).done(function( data ) {
                todo = data;
            }).error(function(xhr, ajaxOptions, thrownError) {
                alert(thrownError);
            });
        },
        openTodo: function(todo, ele) {
            model.curTodo = todo;

            $itm = $(ele.target);
            var hsClass = $itm.hasClass('expanded');

            if (hsClass) {
                $itm.toggleClass('expanded');
            } else {
                $('.todo-list .todo').removeClass('expanded');
                $itm.addClass('expanded');

                if (todo.location) {
                    var map = $('#todoMap').detach();
                    map.appendTo('#myTabContent .active .todo.expanded>.details');
                    map.height(180);
                    map.removeClass('hidden');
                    var todoMap = new google.maps.Map(document.getElementById('todoMap'), {
                    center: { lat: parseFloat(todo.location.lat), lng: parseFloat(todo.location.lng) },
                    zoom: 15
                });
                var marker = new google.maps.Marker({
                    position: { lat: parseFloat(todo.location.lat), lng: parseFloat(todo.location.lng) },
                    map: todoMap,
                    title: todo.location.name
                  });
                }
            }

            return;

          if (todo.location && todo.date) {
              delete $.ajaxSettings.headers['X-CSRF-TOKEN'];
              $.ajax({
                method: "GET",
                url: "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + todo.location.lat + "&lon=" + todo.location.lng + "&mode=json&units=metric&cnt=8&appid=44db6a862fba0b067b1930da0d769e98",
              }).done(function( data ) {
                  var todoDate = moment(todo.date, 'YYYY-MM-DD');
                  var diffDays = todoDate.diff(moment(), 'days');
                  if (todoDate.isAfter(moment())) {
                      if (diffDays < 8) {
                          var daysWeather = data.list[diffDays];
                          model.curTodo.weather = daysWeather;
                      }
                  }
              }).error(function(xhr, ajaxOptions, thrownError) {
                alert(thrownError);
              });
              $.ajaxSettings.headers['X-CSRF-TOKEN'] = $('meta[name="csrf-token"]').attr('content');
          };

            $('#todoModal').on('shown.bs.modal', function(e) {
                if (todo.location) {
                    var todoMap = new google.maps.Map(document.getElementById('todoMap'), {
                        center: { lat: parseFloat(todo.location.lat), lng: parseFloat(todo.location.lng) },
                        zoom: 15
                    });
                    var marker = new google.maps.Marker({
                        position: { lat: parseFloat(todo.location.lat), lng: parseFloat(todo.location.lng) },
                        map: todoMap,
                        title: todo.location.name
                      });
                }
            });

            $('#todoModal').modal('show');
        },
        deleteTodo: function(todo) {
            $.ajax({
                method: "DELETE",
                url: "/todos/" + todo.id,
                data: { 'todo': todo },
            }).done(function( data ) {
                model.todos = data;
            }).error(function(xhr, ajaxOptions, thrownError) {
                alert(thrownError);
            });
        }
    }
});

Vue.component('todo-item', ToDoItem);

var input = $('#time').clockpicker({
    placement: 'bottom',
    align: 'left',
    autoclose: true,
    'default': 'now'
});

var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 15
});
var service = new google.maps.places.PlacesService(map);



var timer;

///////////////////////////////
// Init
//
var app = new Vue({
    el: '#app',
    data: model,
    methods: {
        load: function() {

            // Init time control
			app.getLocation();

            // Load Todos
            app.loadTodos();

			var container = $("#todo-input");
			container.shuffleLetters();

			var num = Math.floor((Math.random() * this.placeholders.length) + 1) - 1;
			container.shuffleLetters({
				"text": this.placeholders[num]
			});
			var num = Math.floor((Math.random() * this.placeholders.length) + 1) - 1;

			// Leave a 6 sec
			setInterval(function(){
				var num = Math.floor((Math.random() * this.model.placeholders.length) + 1) - 1;
				container.shuffleLetters({
					"text": this.model.placeholders[num]
				});
			}, 6000);
        },
        loadTodos: function() {
            $.ajax({
                method: "GET",
                url: "/todos",
            }).done(function( data ) {
                app.todos = data;
            }).error(function(xhr, ajaxOptions, thrownError) {
                alert(thrownError);
            });
        },
		addTodo: function() {
			var text = this.todoinput.content.trim();
			if (text) {
                $.ajax({
                    method: "POST",
                    url: "/todos",
                    data: { 'todo': model.todoinput },
                }).done(function( data ) {
                    app.todos = data;
                }).error(function(xhr, ajaxOptions, thrownError) {
                    alert(thrownError);
                });
                this.todoinput.content = '';
                this.todoinput.date = '';
                this.todoinput.time = '';
                this.todoinput.location = null;
                this.todoinput.book = null;
			}
		},
        addTodoKeyUp: function(e) {
            if (e.which == 13) {
                app.addTodo();
                this.showSuggestions = false;
                return;
            }
			var keywords = [ 'at', 'to', 'read', 'with', 'cancel', 'subscription', 'subscriptions', 'today', 'tomorrow', 'next week', 'next month', 'evening' ];
            if (this.todoinput.content.length > 0)
                this.showSuggestions = true;
            else {
                model.todoinput = tmpInputCopy;
                this.showSuggestions = false;
                this.suggestions = [];
                return;
            }

            // Atempt parsing using regex
            remindWithDayTime();
        },
		stringToWords: function(sentence) {
			var punctuationless = sentence.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
			sentence = punctuationless.replace(/\s{2,}/g," ");

			var words = sentence.split(" ");
			return words;
		},
        suggestClick: function(suggest, e) {
            switch (suggest.action) {
                case 'map':
                    $('#modalMap').on('shown.bs.modal', function(e) {
                        $('#location_name').focus();
                    });
                    $('#modalMap').modal('show');
                    break;

                case 'append':
                    model.todoinput.content = model.todoinput.content + " " + suggest.value;
                    model.suggestions = [];
                    $('#todo-input').focus();
                    break;

                case 'tv_show':
                    model.todoinput.content = model.todoinput.content + " " + suggest.value;
                    model.suggestions = [];
                    $('#modalVideo').modal('show');
                    break;

                case 'movie':
                    model.todoinput.content = model.todoinput.content + " " + suggest.value;
                    model.suggestions = [];
                    $('#modalVideo').modal('show');
                    break;

                default:
                    break;
            }
        },
		getLocation: function() {
		    if (navigator.geolocation) {
		        navigator.geolocation.getCurrentPosition(app.showPosition);
		    } else {
		        alert("Geolocation is not supported by this browser.");
		    }
		},
		showPosition: function (position) {
		    // x.innerHTML = "Latitude: " + position.coords.latitude +
		    // "<br>Longitude: " + position.coords.longitude;
		    model.user_location = position.coords;
		},
        locationInputModalKeyUp: function() {
          clearTimeout(timer);
          var ms = 300; // milliseconds

          request = {
              query: app.locationModalSearch
            };

          timer = setTimeout(function() {
            service.textSearch(request, function(results, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                app.locationModalResults = results;
              }
            });
          }, ms);
        },
        locationClickedModal: function(location) {
            app.todoinput.location = {};
            app.todoinput.location.gid = location.id;
            app.todoinput.location.place_id = location.place_id;
            app.todoinput.location.name = location.name;
            app.todoinput.location.address = location.formatted_address;
            app.todoinput.location.lat = location.geometry.location.lat;
            app.todoinput.location.lng = location.geometry.location.lng;
            app.todoinput.content = app.todoinput.content + " " + location.name + " ";
            model.suggestions = [];
            $('#modalMap').modal('hide');
            app.locationModalSearch = '';
            app.locationModalResults = [];
            $('#todo-input').focus();
        },
        bookModalSearchKeyUp: function() {
          clearTimeout(timer);
          var ms = 300; // milliseconds

          var bookName = model.bookModalSearch;

          timer = setTimeout(function() {
              if (bookName) {
        			$.ajax({
        			 	url: "https://www.googleapis.com/books/v1/volumes?q=" + bookName,
        				success: function(data) {
        					model.bookModalResults = data.items;
        				},
        				error: function() {
        					 model.bookModalResults = [];
        				}
        		   });
        		}
          }, ms);
        },
        bookClickedModal: function(book) {
            model.todoinput.book = {};
            model.todoinput.book.book_id = book.id;
            model.todoinput.book.title = book.volumeInfo.title;
            model.todoinput.book.description = book.volumeInfo.description;
            model.todoinput.book.url = book.volumeInfo.previewLink;
            if (book.volumeInfo.imageLinks)
                model.todoinput.book.image = book.volumeInfo.imageLinks.smallThumbnail;
            else
                model.todoinput.book.image = ' ';
            model.suggestions = [];
            model.todoinput.content = model.todoinput.content + " " + book.volumeInfo.title + " ";
            $('#modalBook').modal('hide');
            model.locationModalSearch = '';
            model.locationModalResults = [];
            $('#todo-input').focus();
        },
        videoModalSearchKeyUp: function() {
          clearTimeout(timer);
          var ms = 300; // milliseconds

          var videoName = model.videoModalSearch;

          timer = setTimeout(function() {
    			if (videoName) {
                    delete $.ajaxSettings.headers['X-CSRF-TOKEN'];
    				$.ajax({
    				 	url: "http://api.themoviedb.org/3/search/movie?api_key=fe186b63a7467f37f45b11043ea0eb63&append_to_response=images&query=" + videoName,
                        method: 'GET',
    					success: function(data) {
    						model.videoModalResults = data.results;
    					},
    					error: function() {
    						model.videoModalResults = [];
    					}
    				});
                    $.ajaxSettings.headers['X-CSRF-TOKEN'] = $('meta[name="csrf-token"]').attr('content');
                }
              }, ms);
        },
        videoClickedModal: function(video) {
            model.todoinput.video = {};
            model.todoinput.video.video_id = video.id;
            model.todoinput.video.title = video.title;
            model.todoinput.video.overview = video.overview;
            model.todoinput.video.url = 'https://www.themoviedb.org/movie/' + video.id;
            model.todoinput.video.image = 'https://image.tmdb.org/t/p/w185' + video.poster_path;
            model.suggestions = [];
            model.todoinput.content = model.todoinput.content + " " + video.title + " ";
            $('#modalVideo').modal('hide');
            model.locationModalSearch = '';
            model.locationModalResults = [];
            $('#todo-input').focus();
        }
    }
});

$('#todo-input').keyup(function(e){ // the keydown even on ul
    e.preventDefault();
    var chr =String.fromCharCode( e.which );
    if (chr == '(') { //down
        var focIdx = -1;
        $('.list-group .list-group-item').each(function(idx, ele) {
            if ($(ele).is(":focus")) {
                focIdx = idx
            } else {
                if (idx > focIdx) {
                    $(ele).focus();
                }
            }
        });
    } else if (chr == '&') { //up
        alert('up')
    }
});

var tmpInputCopy = model.todoinput;
app.load();


function remindWithDayTime() {
    var matchGroup = [
        // 0)remind me
        /^(remind me)$/i,

        // 1)remind me today or tomorrow or next week or next month
        /^remind me (today|tomorrow|next week|next month)$/i,

        // 2)remind me today or tomorrow or next week or next month at
        /^remind me (today|tomorrow|next week|next month) at$/i,

        // 3)remind me today or tomorrow or next week or next month at noon or midday or midnight
        /^remind me (today|tomorrow|next week|next month) at (noon|midday|midnight)$/i,

        // 4)remind me today or tomorrow or next week or next month at 2pm or 2:00pm or 2 pm or 2:00 pm
        /^remind me (today|tomorrow|next week|next month) at \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b/i,

        // 5)remind me in or within
        /^remind me (in|within)$/i,

        // 6)remind me in or within 0-inifinity minutes or hour or days or weeks or months or years
        /^remind me (?:in|within) ([1-9][0-9]*) (min|mins|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/i,

        // 7)remind me to ___ at ____ today or tomorrow or next week or next month
        /^remind me to .*(at).*(today|tomorrow|next week|next month).*$/i,

        // 8)remind me at
        /^remind me (at)$/i,

        // 9)____ today or tomorrow or next week at
        /^.*(today|tomorrow|next week|next month) at$/i,

        // 10)____ today or tomorrow or next week at 2pm or 2:00pm or 2 pm or 2:00 pm
        /^.*(today|tomorrow|next week|next month) at \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b.*$/i,

        // 11)read
        /^(read)$/i,

        // 12)read _____ today or tomorrow or next week
        /^(read).*(today|tomorrow|next week|next month|tonight|tomorrow night)$/i,

        // 13)read _____ today or tomorrow etc at
        /^(read).*(today|tomorrow|next week|next month|tonight|tomorrow night) at$/i,

        // 14)read _____ today or tomorrow or next week etc at a time(eg. 2pm)
        /^(read).*(today|tomorrow|next week|next month|tonight|tomorrow night) (at) \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b$/i,

        //15)watch
        /^(watch)$/i,

        //16)watch _____ today or tomorrow or next week
        /^(watch).*(today|tomorrow|next week|next month|tonight|tomorrow night)$/i,

        //17)watch _____ today or tomorrow etc at
        /^(watch).*(today|tomorrow|next week|next month|tonight|tomorrow night) (at)$/i,

        //18)watch _____ today or tomorrow or next week etc at a time(eg. 2pm)
        /^(watch).*(today|tomorrow|next week|next month|tonight|tomorrow night) (at) \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b$/i,

        //19)listen
        /^(listen)$/i,

        //20)listen _____ today or tomorrow or next week
        /^(listen).*(today|tomorrow|next week|next month|tomorrow night|tonight)$/i,

        //21)listen _____ today or tomorrow etc at
        /^(listen).*(today|tomorrow|next week|next month|tomorrow night|tonight) (at)$/i,

        //22)listen _____ today or tomorrow or next week etc at a time (eg. 7pm)
        /^(listen).*(today|tomorrow|next week|next month|tomorrow night|tonight) (at) \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b$/i,

        //23)Pick up
        /^(pick up)$/i,

        //24)Pick up _____ today or tomorrow or next week
        /^(pick up).*(today|tomorrow|next week|next month|tomorrow night|tonight)$/i,

        //25)Pick up _____ today or tomorrow etc at
        /^(pick up).*(today|tomorrow|next week|next month|tomorrow night|tonight) (at)$/i,

        //26)Pick up _____ today or whenever at a time (eg. 7pm)
        /^(pick up).*(today|tomorrow) (at) \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b$/i,

        //27)Pick up _____ at
        /^(pick up).*(at)$/i,

        //28)send
        /^(send)$/i,

        //29)send _____ today or tomorrow or next week
        /^(send).*(today|tomorrow|next week|next month|tomorrow night|tonight)$/i,

        //30)send _____ today or tomorrow at
        /^(send).*(today|tomorrow|next week|next month|tomorrow night|tonight) (at)$/i,

        //31)send _____ today or tomorrow at time (eg 7pm)
        /^(send).*(today|tomorrow|next week|next month|tomorrow night|tonight) (at) \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b$/i,

        //32)send _____ at
        /^(send).*(at)$/i,

        //33)send _____ to
        /^(send).*(to)$/i,

        //34)pay
        /^(pay)$/i,

        //35)pay _____ today or tomorrow or next week
        /^(pay).*(today|tomorrow|next week|next month|tomorrow night|tonight)$/i,

        //36) Read book or novel or comic at
        /^read (book|comic|novel) (.*) (at)$/i,

    ];

    var result = false;
    model.todoinput.date = null;
    model.todoinput.time = null;

    for (var i = 0; i < matchGroup.length; i++) {
        var regEx = matchGroup[i];

        var matches = model.todoinput.content.match(regEx);

        if (matches)  {
            switch (i) {
                case 0:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }
                    model.suggestions = [
                        { name: "Today", action: "append", value: "today" },
                        { name: "Tomorrow", action: "append", value: "tomorrow" },
                        { name: "Next Week", action: "append", value: "next week" },
                        { name: "Next Month", action: "append", value: "next month" },
                    ];
                    return;

                case 1:
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);

                    return;

                case 2:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);

    				model.suggestions = [
    					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
    				];
                    return;

                case 3:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);

                    switch (matches[2].toLowerCase()) {
                        case 'noon':
                            model.todoinput.time = '12:00:00';
                            break;

                        case 'midday':
                            model.todoinput.time = '12:00:00';
                            break;

                        case 'midnight':
                            model.todoinput.time = '00:00:00';
                            break;
                    }
                    return;

                case 4:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);

                    var timeMatch = matches[2].toLowerCase();
                    setTimeFromRegularTime(timeMatch);
                    return;

                case 5:
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: "Half Hour", action: "append", value: "30 mins" },
                        { name: "1 Hour", action: "append", value: "1 hour" },
                        { name: "1 Day", action: "append", value: "1 day" },
                        { name: "1 Week", action: "append", value: "1 week" },
                    ];

                    model.todoinput.date = '';
                    model.todoinput.time = '';
                    return;

                case 6:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    var numVal = matches[1];
                    var type = matches[2];
                    setTimeFromTimeInterval(numVal, type);
                    return;

                case 7:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[1].toLowerCase()) {
                        case 'at':
            				model.suggestions = [
            					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
            				];
                            break;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 8:
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[1].toLowerCase()) {
                        case 'at':
            				model.suggestions = [
            					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
            				];
                            break;
                    }
                    return;

                case 9:
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[1].toLowerCase()) {
                        case 'at':
            				model.suggestions = [
            					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
            				];
                            break;
                    }
                    return;

                case 10:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);

                    setTimeFromRegularTime(matches[2]);
                    return;

                case 11:
                    model.todoinput.location = null
                    model.todoinput.book = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }
                    model.suggestions = [
                        { name: "Book", action: "book", value: "book" , icon: 'https://maxcdn.icons8.com/Color/PNG/24/Printing/books-24.png'},
                        { name: "Comic", action: "book", value: "comic", icon: 'https://maxcdn.icons8.com/Color/PNG/24/Printing/books-24.png' },
                        { name: "Novel", action: "book", value: "novel", icon: 'https://maxcdn.icons8.com/Color/PNG/24/Printing/books-24.png' },
                    ];
                    return;

                case 12:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 13:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[1]);
                    //Attempts to fix Location and Time
                    model.suggestions = [
                        { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                        ]
                    return;

                case 14:
                    if (matches.length < 5) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);

                    setTimeFromRegularTime(matches[4]);
                    return;

                case 15:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: 'TV Show', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Media_Controls/tv_show-24.png', action: 'tv_show', value: 'tv show' },
                        { name: 'Movie', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Folders/movie_projector-24.png', action: 'movie', value: 'movie' },
                    ];
                    return;

                case 16:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 17:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[3].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 18:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);

                    var timeMatch = matches[4].toLowerCase();
                    setTimeFromRegularTime(timeMatch);
                    return;

                case 19:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: 'Music', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Music/musical_notes-24.png', action: 'tv_show' },
                    ];
                    return;

                case 20:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 21:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[3].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 22:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);

                    var timeMatch = matches[4].toLowerCase();
                    setTimeFromRegularTime(timeMatch);
                    return;

                case 23:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: 'Food Item', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Food/ingredients-24.png', action: 'append', value: 'groceries' },
                        { name: 'Kids', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Baby/children-24.png', action: 'append', value: 'kids' },
                        { name: 'Newspaper', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Very_Basic/news-24.png', action: 'append', value: 'newspaper' },
                        { name: 'Gift', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Ecommerce/gift-24.png', action: 'append', value: 'gift' },
                    ];
                    return;

                case 24:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 25:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[3].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 26:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);

                    var timeMatch = matches[4].toLowerCase();
                    setTimeFromRegularTime(timeMatch);
                    return;

                case 27:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[2].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 28:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: 'Email', icon: 'https://maxcdn.icons8.com/Color/PNG/24/User_Interface/email-24.png', action: 'append', value: 'email' },
                        { name: 'Presentation', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Business/training-24.png', action: 'append', value: 'presentation' },
                        { name: 'Notes', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Messaging/note-24.png', action: 'append', value: 'notes' },
                        { name: 'Message', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Messaging/chat-24.png', action: 'append', value: 'message' },
                        { name: 'Resume', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Messaging/contact_card-24.png', action: 'append', value: 'resume' },
                    ];
                    return;

                case 29:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 30:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[3].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 31:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);

                    var timeMatch = matches[4].toLowerCase();
                    setTimeFromRegularTime(timeMatch);
                    return;

                case 32:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[2].toLowerCase()) {
                        case 'at':
                            model.suggestions = [
                                { name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
                            ];
                            break;
                    }
                    return;

                case 33:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    switch (matches[2].toLowerCase()) {
                        case 'to':
                            model.suggestions = [
                                { name: 'Friend', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Healthcare/groups-24.png', action: 'friend' },
                                { name: 'Boss', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Business/permanent_job-24.png', action: 'boss' },
                                { name: 'Relative/Family', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Cinema/family-24.png', action: 'family' },
                            ];
                            break;
                    }
                    return;

                case 34:
                    model.todoinput.location = null;
                    if (matches.length < 2) {
                        model.suggestions = [];
                        return;
                    }

                    model.suggestions = [
                        { name: 'Bill', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Finance/bill-24.png', action: 'append', value: 'bill' },
                        { name: 'Insurance', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Clothing/umbrella-24.png', action: 'append', value: 'insurance' },
                        { name: 'Tax', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Finance/USD-24.png', action: 'append', value: 'tax' },
                        { name: 'Fees', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Finance/money_bag-24.png', action: 'append', value: 'fees' },
                    ];
                    return;

                case 35:
                    if (matches.length < 3) {
                        model.suggestions = [];
                        return;
                    }

                    setFutureDate(matches[2]);
                    return;

                case 36:
                    if (matches.length < 4) {
                        model.suggestions = [];
                        return;
                    }

                    var bookName = matches[2];
                    if (bookName) {
						$.ajax({
						 	url: "https://www.googleapis.com/books/v1/volumes?q=" + bookName + "&key=AIzaSyA0wKFZHaijYmeQtiCwO9DP_RHDlW08UL8",
							success: function(data) {
                                if (data.items.length > 0 && model.todoinput.book == null)
                                    model.todoinput.book = data.items[0];
							},
							error: function() {
								 model.suggestions = [];
							}
					   });
					}

                    switch (matches[3].toLowerCase()) {
                        case 'at':
            				model.suggestions = [
            					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
            				];
                            break;
                    }
                    return;
            }
            model.suggestions = [];
        } else {
            model.suggestions = [];
        }
    }

    return result;
}

// Takes string like today, tomorrow and assign to date field
function setFutureDate(dateStr) {
    switch (dateStr.toLowerCase()) {
        case 'today':
            model.todoinput.date = moment().format('YYYY-MM-DD');
            break;

        case 'tomorrow':
            model.todoinput.date = moment().add(1, 'days').format('YYYY-MM-DD');
            break;

        case 'next week':
            model.todoinput.date = moment().add(1, 'weeks').format('YYYY-MM-DD');
            break;

        case 'next month':
            model.todoinput.date = moment().add(1, 'months').format('YYYY-MM-DD');
            break;

        case 'tomorrow night':
            model.todoinput.date = moment().add(1, 'days').format('YYYY-MM-DD');
            model.todoinput.time = "20:00:00";
            break;

        case 'tonight':
            model.todoinput.date = moment().format('YYYY-MM-DD');
            model.todoinput.time = "20:00:00";
            break;
    }
}

function setTimeFromRegularTime(timeMatch) {
    timeMatch = timeMatch.toLowerCase();
    if (timeMatch.indexOf(":")) {
        if (timeMatch.indexOf(" am") || timeMatch.indexOf(" pm")) {
            model.todoinput.time = moment(timeMatch, 'h:mm a').format('HH:mm:ss');
        } else if (timeMatch.indexOf("am") || timeMatch.indexOf("pm")) {
            model.todoinput.time = moment(timeMatch, 'h:mma').format('HH:mm:ss');
        } else if (!timeMatch.indexOf("am") && !timeMatch.indexOf("pm")) {
            model.todoinput.time = moment(timeMatch, 'HH:mm').format('HH:mm:ss');
        }
    } else if (timeMatch.indexOf(" am") || timeMatch.indexOf(" pm")) {
        model.todoinput.time = moment(timeMatch, 'h a').format('HH:mm:ss');
    } else if (timeMatch.indexOf("am") || timeMatch.indexOf("pm")) {
        model.todoinput.time = moment(timeMatch, 'ha').format('HH:mm:ss');
    }
}

function setTimeFromTimeInterval(numVal, type) {
    switch (type.toLowerCase()) {
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
            model.todoinput.date = moment().add(numVal, 'minutes').format('YYYY-MM-DD');
            model.todoinput.time = moment().add(numVal, 'minutes').format('HH:mm:ss');
            break;

        case 'hour':
        case 'hours':
            model.todoinput.date = moment().add(numVal, 'hours').format('YYYY-MM-DD');
            model.todoinput.time = moment().add(numVal, 'hours').format('HH:mm:ss');
            break;

        case 'day':
        case 'days':
            model.todoinput.date = moment().add(numVal, 'days').format('YYYY-MM-DD');
            model.todoinput.time = moment().add(numVal, 'days').format('HH:mm:ss');
            break;

        case 'week':
        case 'weeks':
            model.todoinput.date = moment().add(numVal, 'weeks').format('YYYY-MM-DD');
            model.todoinput.time = moment().add(numVal, 'weeks').format('HH:mm:ss');
            break;

        case 'year':
        case 'years':
            model.todoinput.date = moment().add(numVal, 'years').format('YYYY-MM-DD');
            model.todoinput.time = moment().add(numVal, 'years').format('HH:mm:ss');
            break;
    }
}

function tokenizeString(sentence) {
    var tokens = sentence.toLowerCase().split(/\s*\b\s*/);
    return tokens;
}

var weatherIcons = [
    {clouds: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/clouds-96.png'},
    {sun: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/sun-96.png'},
    {rain: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/rain-96.png'},
    {snow: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/snow-96.png'},
    {moderate_rain: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/moderate-rain-96.png'},
    {partly_cloudy_day: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/partly-cloudy-day-96.png'},
    {heavy_rain: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/heavy-rain-96.png'},
    {hail: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/hail-96.png'},
    {sleet: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/sleet-96.png'},
    {storm: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/storm-96.png'},
    {fog_day: 'https://maxcdn.icons8.com/Color/PNG/96/Weather/fog_day-96.png'},
];

function getWeatherIconLink(weather) {
    switch (weather) {
        case clear:
            weatherIcons.sun;
            break;
        default:
            return weatherIcons.sun;
    }
}

function findById(source, id) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return source[i];
    }
  }
  return null;
}
