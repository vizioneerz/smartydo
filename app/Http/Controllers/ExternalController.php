<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ExternalController extends Controller
{
    public function searchLocations()
    {
        $query = Input::get('query', null);

        if (null)
            return response([], 200);

            $curl = curl_init();

            curl_setopt_array($curl, array(
              CURLOPT_URL => "https://maps.googleapis.com/maps/api/place/textsearch/json?query=utech&key=AIzaSyA0wKFZHaijYmeQtiCwO9DP_RHDlW08UL8",
              CURLOPT_RETURNTRANSFER => true,
              CURLOPT_ENCODING => "",
              CURLOPT_MAXREDIRS => 10,
              CURLOPT_TIMEOUT => 30,
              CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
              CURLOPT_CUSTOMREQUEST => "GET",
            ));

            $res = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);

            if ($err) {
                return response($err, 200);
            } else {
                return response($res, 200);
            }
    }
}
