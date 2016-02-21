<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;

use App\Todo;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use DB;
use App\Location;

class TodoController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $todos = Todo::with(['location'])->where('user_id', $user->id)->get();

        return response($todos, 200);
    }

    public function store()
    {
        $user = Auth::user();
        $newTodo = Input::get('todo', null);

        if (empty($newTodo) || empty($newTodo))
            return response('Could not create todo.', 400);

        $location = $newTodo['location'];

        if (!empty($location)) {
            $location = new Location;
            $location->name = $newTodo['location']['name'];
            $location->lat = $newTodo['location']['lat'];
            $location->lng = $newTodo['location']['lng'];
            $location->place_id = $newTodo['location']['place_id'];
            $location->gid = $newTodo['location']['gid'];
            $location->address = $newTodo['location']['address'];
        }

        $todo = new Todo;
        $todo->content = $newTodo['content'];
        $todo->user_id = $user->id;
        $todo->completed = false;
        $todo->date = $newTodo['date'];
        $todo->time = $newTodo['time'];

        DB::transaction(function() use ($location, $todo) {
            $todo->save();
            if (!empty($location)) {
                $location->todo_id = $todo->id;
                $location->save();
            }
        });

        return $this->index();
    }

    public function update($id)
    {
        $todo = Todo::find($id);
        $newTodo = Input::get('todo', null);

        if (empty($todo) || empty($newTodo))
            return response('Could not find todo item.', 404);

        $todo->content = $newTodo['content'];
        $todo->completed = $newTodo['completed'];
        $todo->save();

        return response($todo, 200);
    }

    public function destroy($id)
    {
        $todo = Todo::find($id);
        $newTodo = Input::get('todo', null);

        if (empty($todo) || empty($newTodo))
            return response('Could not find todo item.', 404);

        if (!$todo->delete())
            return response('Could not delete item.', 400);


        return $this->index();
    }
}
