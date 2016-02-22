<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBooksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('todo_id')->unsigned();
            $table->string('book_id');
            $table->string('title');
            $table->text('description');
            $table->text('url');
            $table->text('image');  
            $table->timestamps();
            $table->foreign('todo_id')->references('id')->on('todos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('books');
    }
}
