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
use App\Book;
use App\Video;

class TodoController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $todos = Todo::with(['location', 'book', 'video'])->where('user_id', $user->id)->get();

        return response($todos, 200);
    }

    public function store()
    {
        $user = Auth::user();
        $newTodo = Input::get('todo', null);

        if (empty($newTodo) || empty($newTodo))
            return response('Could not create todo.', 400);

        $location = $newTodo['location'];
        $book = $newTodo['book'];
        $video = $newTodo['video'];

        if (!empty($location)) {
            $location = new Location;
            $location->name = $newTodo['location']['name'];
            $location->lat = $newTodo['location']['lat'];
            $location->lng = $newTodo['location']['lng'];
            $location->place_id = $newTodo['location']['place_id'];
            $location->gid = $newTodo['location']['gid'];
            $location->address = $newTodo['location']['address'];
        }
        if (!empty($book)) {
            $book = new Book;
            $book->title = $newTodo['book']['title'];
            $book->book_id = $newTodo['book']['book_id'];
            $book->description = $newTodo['book']['description'];
            $book->url = $newTodo['book']['url'];
            $book->image = $newTodo['book']['image'];
        }
        if (!empty($video)) {
            $video = new Video;
            $video->title = $newTodo['video']['title'];
            $video->video_id = $newTodo['video']['video_id'];
            $video->overview = $newTodo['video']['overview'];
            $video->url = $newTodo['video']['url'];
            $video->image = $newTodo['video']['image'];
        }

        $todo = new Todo;
        $todo->content = $newTodo['content'];
        $todo->user_id = $user->id;
        $todo->completed = false;
        $todo->date = $newTodo['date'];
        $todo->time = $newTodo['time'];

        DB::transaction(function() use ($location, $book, $video, $todo) {
            $todo->save();
            if (!empty($location)) {
                $location->todo_id = $todo->id;
                $location->save();
            }
            if (!empty($book)) {
                $book->todo_id = $todo->id;
                $book->save();
            }
            if (!empty($video)) {
                $video->todo_id = $todo->id;
                $video->save();
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
