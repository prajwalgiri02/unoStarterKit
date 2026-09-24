<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('firebase_tokens')->delete();

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'device_token']);
        });

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->string('device_id')->after('user_id')->unique();
            $table->text('device_token')->change();
            $table->string('token_type', 20)->default('fcm')->after('device_token');
            $table->string('device_name')->nullable()->after('platform');
            $table->string('app_version', 50)->nullable()->after('device_name');
            $table->timestamp('last_used_at')->nullable()->after('app_version');
        });
    }

    public function down(): void
    {
        DB::table('firebase_tokens')->delete();

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->dropUnique(['device_id']);
            $table->dropColumn(['device_id', 'token_type', 'device_name', 'app_version', 'last_used_at']);
        });

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->string('device_token')->change();
            $table->unique(['user_id', 'device_token']);
        });

        Schema::table('firebase_tokens', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
