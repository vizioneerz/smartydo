<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    public function location()
    {
        return $this->hasOne('App\Location', 'todo_id', 'id');
    }
}
