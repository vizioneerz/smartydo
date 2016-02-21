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
};


///////////////////////////////
// Components
//
var ToDoItem = Vue.extend({
	props: ['todo'],
	template: '<a class="list-group-item todo" href="#" v-on:click.stop="openTodo(todo)" v-bind:class="classObject">' +
					'<input type="checkbox" v-model="todo.completed" v-on:click.stop="markTodoCompleted(todo)">' +
                    ' <span class="badge delete" v-if="todo.time" v-on:click.stop="deleteTodo(todo)">DELETE</span>' +
                    '{{ todo.content }}' +
                    '<img src="./img/overdue.png" v-if="showOverdue" class="status" />' +
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
        openTodo: function(todo) {
            model.curTodo = todo;

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

            // Atempty using regex

            var result = remindWithDayTime();
            if (result) {
                return;
            }


            return;


            var words = app.stringToWords(this.todoinput.content.toLowerCase());
			var word = words[words.length-1];

			if (word == "at") {
				this.suggestions = [
					{ name: 'Location', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Maps/marker-24.png', action: 'map' },
					{ name: 'Time', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Time_And_Date/clock-24.png', action: 'time_picker' },
				]
			} else if (word == "subscription" || word == "subscriptions") {
				this.suggestions = [
					{ name: 'Amazon Prime', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Ecommerce/delivery-24.png' },
					{ name: 'Netflix', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Photo_Video/showing_video_frames-24.png' },
					{ name: 'Hulu Plus', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Photo_Video/showing_video_frames-24.png' },
					{ name: 'Google Music', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Very_Basic/music-24.png' },
					{ name: 'Gym', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Sports/barbell-24.png' },
				]
			} else if (word == "gym" || (word == "membership" && words[words.length-2] == "gym")) {
				$.ajax({
				 	url: "https://api.foursquare.com/v2/venues/search?client_id=USJJWMVVJSNGILULOHHBDYFROKFZBMWYF3DC2JS5PL2N3ECK&client_secret=EJB1SGY2AB2S5QSMSNR30VX5Z4G5IMMFQAHVRDSO5DU4CAZO&v=20130815&ll=" + model.location.latitude + "," + model.location.longitude + "&query=gym",
					success: function(data) {
						model.suggestions = [];
						for (var i = 0; i < (data.response.venues.length > 10 ? 10 : data.response.venues.length); i++) {
							var newSuggest = {
								name: data.response.venues[i].name,
								icon: 'https://maxcdn.icons8.com/Color/PNG/24/Sports/barbell-24.png',
								gym: data.response.venues[i],
							};
							model.suggestions.push(newSuggest);
						};
					},
					error: function() {
						 model.suggestions = [];
					}
				});
			} else if (word == "membership") {
				this.suggestions = [
					{ name: 'Gym', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Sports/barbell-24.png' },
				]
			}
             else {
                this.suggestions = [];
            }

			// Parse date
			var timeWords = [ 'today', 'tonight', 'midday', 'afternoon', 'tomorrow', 'next week', 'next month', 'evening'];
			for (var i = timeWords.length - 1; i >= 0; i--) {
				if (this.todoinput.content.toLowerCase().includes(timeWords[i])) {
					switch (timeWords[i]) {
						case 'tonight':
							this.todoinput.date = timeWords[i];
							this.todoinput.time = '20:00';
							break;

						case 'midday':
							this.todoinput.time = '12:00';
							break;

						case 'afternoon':
							this.todoinput.time = '14:00';
							break;

						case 'evening':
							this.todoinput.time = '18:00';
							break;

						default:
							this.todoinput.date = timeWords[i];
							break;
					}
					break;
				}
            }

			// Regular Expression to extract time
			var rx = /\b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b/;
			var timeMatch = rx.exec(this.todoinput.content);
			if (timeMatch) {
				// Save time
				this.todoinput.time = timeMatch[0];
			}
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

                case 'time_picker':
                    input.clockpicker('show')
                            .clockpicker('toggleView', 'minutes');
                    break;

                case 'append':
                    model.todoinput.content = model.todoinput.content + " " + suggest.value;
                    model.suggestions = [];
                    $('#todo-input').focus();
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
        // remind me
        /^(remind me)$/i,

        // remind me today or tomorrow or next week or next month
        /^remind me (today|tomorrow|next week|next month)$/i,

        // remind me today or tomorrow or next week or next month at
        /^remind me (today|tomorrow|next week|next month) at$/i,

        // remind me today or tomorrow or next week or next month at noon or midday or midnight
        /^remind me (today|tomorrow|next week|next month) at (noon|midday|midnight)$/i,

        // remind me today or tomorrow or next week or next month at 2pm or 2:00pm or 2 pm or 2:00 pm
        /^remind me (today|tomorrow|next week|next month) at \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b/i,

        // remind me in or within
        /^remind me (in|within)$/i,

        // remind me in or within 0-inifinity minutes or hour or days or weeks or months or years
        /^remind me (?:in|within) ([1-9][0-9]*) (min|mins|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)$/i,

        // remind me to ___ at ____ today or tomorrow or next week or next month
        /^remind me to .*(at).*(today|tomorrow|next week|next month).*$/i,

        // remind me at
        /^remind me (at)$/i,

        // ____ today or tomorrow or next week at
        /^.*(today|tomorrow|next week|next month) at$/i,

        // ____ today or tomorrow or next week at 2pm or 2:00pm or 2 pm or 2:00 pm
        /^.*(today|tomorrow|next week|next month) at \b((?:0?[1-9]|1[0-2])(?!\d| (?![ap]))[:.]?(?:(?:[0-5][0-9]))?(?:\s?[ap]m)?)\b.*$/i,
    ];

    var result = false;
    model.todoinput.date = '';
    model.todoinput.time = '';

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
    					{ name: 'Time', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Time_And_Date/clock-24.png', action: 'time_picker' },
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
            					{ name: 'Time', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Time_And_Date/clock-24.png', action: 'time_picker' },
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
            					{ name: 'Time', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Time_And_Date/clock-24.png', action: 'time_picker' },
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
            					{ name: 'Time', icon: 'https://maxcdn.icons8.com/Color/PNG/24/Time_And_Date/clock-24.png', action: 'time_picker' },
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
