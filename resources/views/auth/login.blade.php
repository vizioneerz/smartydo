@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-5 col-md-offset-4">
            <div class="panel panel-primary" style="margin-top: 25%;margin-bottom: 25%;">
                <div class="panel-heading" style="color:white;text-align: center;font-size: 20px;">Smarty Do</div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                        {!! csrf_field() !!}

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <!-- <label class="col-md-4 control-label">Email</label> -->

                            <div class="col-md-10 col-md-offset-1">
                                <input type="email" class="form-control" placeholder="Email Address" name="email" value="{{ old('email') }}">

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <!-- <label class="col-md-4 control-label">Password</label> -->

                            <div class="col-md-10 col-md-offset-1">
                                <input type="password" class="form-control" placeholder="Password" name="password">

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <!-- <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember"> Remember Me
                                    </label>
                                </div>
                            </div>
                        </div> -->

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-3">
                                <button type="submit" class="btn btn-primary" style="width: 200px;">
                                    <i class="fa fa-btn fa-sign-in"></i>Login
                                </button>

                                <!-- <a class="btn btn-link" href="{{ url('/password/reset') }}">Forgot Your Password?</a> -->
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-9 col-md-offset-4">
                                <p>Click Here To <a href="{{ url('/register') }}">Register</a></p>


                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
