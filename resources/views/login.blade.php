<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="csrf-token" content="<?php echo csrf_token() ?>"/>
        <title>Smarty Do Login</title>

        <link rel="stylesheet" href="./css/bootstrap.min.css">
        <link rel="stylesheet" href="./css/app.css">
    </head>
    <body id="login">

        <div class="container">

            <div class="row">
                <div class="col-sm-6 col-sm-offset-3">

                    <div class="panel panel-default">
                        <div class="panel-heading">Login</div>
                        <div class="panel-body">
                            <form name="loginForm" class="login" action="/login" method="post">
                                <div>
                                    <input type="text" name="email" v-model="username" value="test@account.com">
                                </div>
                                <div>
                                    <input type="password" name="password" v-model="password" value="password">
                                </div>
                                <div>
                                    <input type="submit" value="Login"/>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

        </div>


        <script src="./js/jquery-2.2.0.min.js" charset="utf-8"></script>
        <script src="./js/vue.js" charset="utf-8"></script>
        <script src="./js/bootstrap.js" charset="utf-8"></script>
        <script src="./js/login.js" charset="utf-8"></script>
    </body>
</html>
