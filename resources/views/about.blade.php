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
          <a class="navbar-brand"  style="color:white;" href="{{ url('/') }}">Smarty Do</a>
        </div>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-2">
          <ul class="nav navbar-nav navbar-right">
            <ul class="nav navbar-nav navbar-right">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown"  style="color:white;" role="button" aria-expanded="false">
                  {{ $user->first_name }} <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" role="menu">
                  <li><a href=""><i class="fa fa-btn fa-sign-out"></i>About</a></li>
                  <li><a href="{{ url('/logout') }}"><i class="fa fa-btn fa-sign-out"></i>Logout</a></li>
                </ul>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container">
      <div class="panel panel-default col-sm-12" style="height: auto;margin-top: 100px;">
        <div class="panel-body">
          <div class="panel-heading" style="color:black;text-align: left;font-size: 20px;"> <img id="selfie_image" src="img/vtz.png" alt="" ></div>
        </div>
        <div class="col-sm-5 col-sm-offset-4">
          <h3 style="text-align: center;">Meet Our Team</h3>
        </div>

        <div class="col-sm-10 col-sm-offset-1">
        <img id="selfie_image" src="img/selfie.jpg" alt="" class="col-sm-5 col-md-offset-4">
        </div>

        <div class="col-sm-12 col-sm-offset-4">
          <h6 style="float: left;margin-right: 12px;font-size: 20px;">Kevin Mckoy</h6>
          <h6 style="float: left;margin-right: 15px;font-size: 20px;">Jhevaughn Davis</h6>
          <h6 style="font-size: 20px;">Che-Andre Gordon</h6>
        </div>
        <div class="col-sm-5 col-sm-offset-4">
          <h3 style="text-align: center;">Credits</h3>
        </div>

        <div class="col-sm-5 col-sm-offset-4">
            <ul class="list-group">
                <li class="list-group-item">Google Books Api</li>
                <li class="list-group-item">Google Maps Api</li>
                <li class="list-group-item">Google Places Api</li>
          <li class="list-group-item">Bootstrap Framework<span class="badge" style="opacity: 1;">MIT License</span></li>
          <li class="list-group-item">Jquery Library<span class="badge" style="opacity: 1;">MIT License</span></li>
          <li class="list-group-item">Vue.js<span class="badge" style="opacity: 1;">MIT License</span></li>
          <li class="list-group-item">Moment.js<span class="badge" style="opacity: 1;">MIT License</span></li>
          <li class="list-group-item">Npm.js<span class="badge" style="opacity: 1;">MIT License</span></li>

        </ul>
        </div>
      </div>
    </div>
    <script src="./js/jquery-2.2.0.min.js" charset="utf-8"></script>
    <!-- <script src="./js/require.js" charset="utf-8"></script> -->
    <script src="./js/vue.js" charset="utf-8"></script>
    <script src="./js/bootstrap.js" charset="utf-8"></script>
    <script src="./js/moment.js" charset="utf-8"></script>
    <script src="./js/bootstrap-clockpicker.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA0wKFZHaijYmeQtiCwO9DP_RHDlW08UL8&libraries=places"></script>
    <script src="./js/app.js" charset="utf-8"></script>
  </body>
</html>
