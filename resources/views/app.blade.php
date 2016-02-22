<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="csrf-token" content="<?php echo csrf_token() ?>"/>
        <title>Smarty Do</title>

        <link rel="stylesheet" href="./css/bootstrap.min.css">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link rel="stylesheet" href="./css/bootstrap-clockpicker.min.css">
        <link rel="stylesheet" href="./css/app.css">
    </head>

    <body id="app">

        <nav class="navbar navbar-inverse navbar-fixed-top">
          <div class="container">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-2">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="#">Smarty Do</a>
            </div>

            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-2">
              <ul class="nav navbar-nav navbar-right">
                <!-- <li><a href="#">Link</a></li> -->
              </ul>
            </div>
          </div>
        </nav>

        <div class="addoverlay" v-show="showSuggestions" transition="fade">
        	<div class="container">
        		<div class="row">
        			<div class="col-sm-8 col-sm-offset-2">
        				<div class="tags">
        					<span class="label label-primary" v-if="todoinput.time">TIME: @{{ todoinput.time }}</span>
        					<span class="label label-success" v-if="todoinput.date">DATE: @{{ todoinput.date }}</span>
        					<span class="label label-warning" v-if="todoinput.location">LOCATION: @{{ todoinput.location.name }}</span>
        					<span class="label label-info" v-if="todoinput.book">BOOK: @{{ todoinput.book.title }}</span>
        					<span class="label label-danger" v-if="todoinput.movie">MOVIE: @{{ todoinput.movie }}</span>
        					<span class="label label-warning" v-if="todoinput.tv">TV: @{{ todoinput.tv }}</span>
        				</div>
        			</div>
        			<div class="col-sm-8 col-sm-offset-2">

        				<div class="spacer20"></div>

        				<div class="list-group card">
        					<a class="list-group-item" href="#" v-for="suggest in suggestions" v-on:click="suggestClick(suggest)">
        						<img v-bind:src="suggest.icon" v-if="suggest.icon" alt="@{{ suggest.name }}" style="margin-right: 10px;vertical-align: top;">
        						<span style="display: inline-block;">
        							<b>@{{ suggest.name }}</b><br>
        							<span v-if="suggest.flight">@{{ suggest.flight.time }} </span>
        						</span>
        						<flight-card v-if="suggest.flight" :flight="suggest.flight"></flight-card>

        						<div v-if="suggest.book">
        							<div class="spacer20"></div>
        							<div class="row">
        								<div class="col-sm-3">
        									<img v-bind:src="suggest.book.volumeInfo.imageLinks.thumbnail"  style="margin-right: 10px;vertical-align: top;" />
        								</div>
        								<div class="col-sm-9">
        									<b>@{{ suggest.book.volumeInfo.title }}</b><br>
        									Novel by <span v-for="author in suggest.book.volumeInfo.authors">@{{ author + ", " }}</span><br>
        									<p>@{{ suggest.book.volumeInfo.description }}</p>
        								</div>
        							</div>
        						</div>

        						<div v-if="suggest.movie">
        							<div class="spacer20"></div>
        							<div class="row">
        								<div class="col-sm-3">
        									<img v-bind:src="'https://image.tmdb.org/t/p/w185/' + suggest.movie.poster_path"  style="margin-right: 10px;vertical-align: top;" />
        								</div>
        								<div class="col-sm-9">
        									<b>@{{ suggest.movie.title }}</b><br>
        									<p>@{{ suggest.movie.overview }}</p>
        								</div>
        							</div>
        						</div>

        						<div v-if="suggest.tv">
        							<div class="spacer20"></div>
        							<div class="row">
        								<div class="col-sm-3">
        									<img v-bind:src="'https://image.tmdb.org/t/p/w185/' + suggest.tv.poster_path"  style="margin-right: 10px;vertical-align: top;" />
        								</div>
        								<div class="col-sm-9">
        									<b>@{{ suggest.tv.name }}</b><br>
        									<p>@{{ suggest.tv.overview }}</p>
        								</div>
        							</div>
        						</div>
        					</a>
        				</div>

        			</div>
        		</div>
        	</div>
        </div>

        <div class="container">

            <div class="content">

                <div class="row">
                    <div class="col-sm-10 col-sm-offset-1">
            			<form class="searchbox" v-on:submit.prevent="addTodo" >
                            <input id="todo-input" type="text" v-model="todoinput.content" input v-on:keyup="addTodoKeyUp" placeholder="new todo goes here">
                            <input class="hidden" id="time" v-model="todoinput.time" placeholder="Now">
            			</form>

            			<div class="spacer20"></div>
            		</div>
                </div>

                <div class="row" v-show="!showSuggestions" transition="fade">
                    <div class="col-sm-10 col-sm-offset-1">

                    <ul class="nav nav-tabs nav-justified">
                        <li class=""><a href="#completed" data-toggle="tab" aria-expanded="false">Completed</a></li>
                        <li class="active"><a href="#upcoming" data-toggle="tab" aria-expanded="false">Upcoming</a></li>
                        <li class=""><a href="#all" data-toggle="tab" aria-expanded="true">All</a></li>
                    </ul>
                    <div id="myTabContent" class="tab-content">
                        <div class="tab-pane fade" id="completed">
                			<div class="list-group card todo-list">
    				            <todo-item v-for="todo in todos | filterBy '1' in 'completed'" :todo="todo"></todo-item>
            			    </div>
                        </div>
                        <div class="tab-pane fade" id="all">
                			<div class="list-group card todo-list">
    				            <todo-item v-for="todo in todos" :todo="todo"></todo-item>
            			    </div>
                        </div>
                        <div class="tab-pane fade active in" id="upcoming">
                			<div class="list-group card todo-list">
    				            <todo-item v-for="todo in todos | orderBy 'date' 'time' | filterBy '0' in 'completed'" :todo="todo"></todo-item>
            			    </div>
                        </div>
                    </div>

            		</div>
                </div>

            </div>

        </div>


        <!-- Map Modal -->
        <div class="modal fade" id="modalMap" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                  <input type="text" id="location_name" class="form-control" v-model="locationModalSearch" v-on:keyup="locationInputModalKeyUp" placeholder="Search for Place" value="">
                  <div class="spacer20"></div>
                  <div class="list-group table-of-contents">
                      <a href="#" class="list-group-item" v-for="location in locationModalResults" v-on:click="locationClickedModal(location)">
                           <h4 class="list-group-item-heading">@{{{ location.name }}}</h4>
                           <p class="list-group-item-text">@{{{ location.formatted_address }}}</p>
                      </a>
                    </div>
              </div>
            </div>
            <input id="location_lat" type="text" class="hidden" v-model="location_lat" value="">
            <input id="location_lng" type="text" class="hidden" v-model="location_lng" value="">
          </div>
      </div>

        <!-- Book Modal -->
        <div class="modal fade" id="modalBook" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                  <input type="text" id="book_name" class="form-control" v-model="bookModalSearch" v-on:keyup="bookModalSearchKeyUp" placeholder="Search for Book" value="">
                  <div class="spacer20"></div>
                  <div class="list-group table-of-contents">
                      <a href="#" class="list-group-item" v-for="book in bookModalResults" v-on:click="bookClickedModal(book)">
                          <img src="@{{{ book.volumeInfo.imageLinks.smallThumbnail }}}" v-if="book.volumeInfo.imageLinks" style="float:left;max-height:180px;height:auto;margin-right:15px;" />
                          <img src="https://maxcdn.icons8.com/Color/PNG/48/Printing/books-48.png" v-if="!book.volumeInfo.imageLinks" style="float:left;max-height:48px;height:auto;" />
                           <h4 class="list-group-item-heading">@{{{ book.volumeInfo.title }}}</h4>

               				<span class="tags" style="book.volumeInfo.authors">
               					<span class="label label-primary" v-for="author in book.volumeInfo.authors">@{{{ author }}}</span>
               				</span>

                           <p class="list-group-item-text" style="max-height:115px;overflow:hidden;">@{{{ book.volumeInfo.description }}}</p>
                      </a>
                    </div>
              </div>
            </div>
          </div>
      </div>

        <!-- Movie and TV Show Modal -->
        <div class="modal fade" id="modalVideo" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                  <input type="text" id="video_name" class="form-control" v-model="videoModalSearch" v-on:keyup="videoModalSearchKeyUp" placeholder="Search for Movie or TV Show" value="">
                  <div class="spacer20"></div>
                  <div class="list-group table-of-contents">
                      <a href="#" class="list-group-item" v-for="video in videoModalResults" v-on:click="videoClickedModal(video)">
                          <img src="@{{{'https://image.tmdb.org/t/p/w185' + video.poster_path }}}" v-if="video.poster_path" style="float:left;max-height:180px;height:auto;margin-right:15px;" />
                          <img src="http://www.movli.com/images/movie-default.jpg" v-if="!video.poster_path" style="float:left;max-height:180px;height:auto;margin-right:15px;" />
                           <h4 class="list-group-item-heading">@{{{ video.title }}}</h4>

                           <p class="list-group-item-text" style="max-height:115px;overflow:hidden;">@{{{ video.overview }}}</p>
                      </a>
                    </div>
              </div>
            </div>
          </div>
      </div>

        <div id="todoMap" class="hidden" style="height:240px;margin-top:15px;margin-left:-20px;margin-right:-20px;" />
        <div id="map" class="hidden" />

        <script src="./js/jquery-2.2.0.min.js" charset="utf-8"></script>
        <!-- <script src="./js/require.js" charset="utf-8"></script> -->
        <script src="./js/vue.js" charset="utf-8"></script>
        <script src="./js/bootstrap.js" charset="utf-8"></script>
        <script src="./js/moment.js" charset="utf-8"></script>
        <script src="./js/bootstrap-clockpicker.min.js" charset="utf-8"></script>
        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA0wKFZHaijYmeQtiCwO9DP_RHDlW08UL8&libraries=places"></script>
        <script src="./js/jquery.shuffleLetters.js" charset="utf-8"></script>
        <script src="./js/app.js" charset="utf-8"></script>
    </body>
</html>
