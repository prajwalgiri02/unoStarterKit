<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type')->default('broadcast')->index()->after('id');
            $table->foreignId('created_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('notifications')->where('type', 'admin_alert')->delete();

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn('type');
            $table->foreignId('created_by')->nullable(false)->change();
        });
    }
};
