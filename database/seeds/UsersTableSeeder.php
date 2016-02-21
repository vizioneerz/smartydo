<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;

class UsersTableSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();

		User::create([
			'first_name'		=> 'Test',
			'last_name'			=> 'Account',
			'email'				=> 'test@account.com',
			'password'			=>	bcrypt('password'),
			'remember_token'	=> ''
		]);
		User::create([
			'first_name'		=> 'Demo',
			'last_name'			=> 'Account',
			'email'				=> 'demo@account.com',
			'password'			=>	bcrypt('demo'),
			'remember_token'	=> ''
		]);
	}

}
