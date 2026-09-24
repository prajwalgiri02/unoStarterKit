<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\ModuleRemover;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ModuleRemoverTest extends TestCase
{
    private string $base;

    protected function setUp(): void
    {
        parent::setUp();

        $this->base = sys_get_temp_dir().DIRECTORY_SEPARATOR.'module-remover-'.uniqid();

        File::ensureDirectoryExists($this->base.'/routes/cms');
        File::ensureDirectoryExists($this->base.'/resources/js/Pages/cms/faq');
        File::put($this->base.'/routes/cms/faq.php', '<?php');
        File::put($this->base.'/resources/js/Pages/cms/faq/index.tsx', 'export default {}');
        File::put($this->base.'/resources/js/sidebar.ts', implode("\r\n", [
            'export const sidebar = [',
            '    { label: "Dashboard" },',
            '    // @module:faqs',
            '    { label: "FAQs" },',
            '    // @endmodule:faqs',
            '    // @module:faqs_extra',
            '    { label: "Other" },',
            '    // @endmodule:faqs_extra',
            '];',
            '',
        ]));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->base);

        parent::tearDown();
    }

    public function test_it_deletes_module_paths_and_marked_regions(): void
    {
        $module = ['paths' => ['routes/cms/faq.php', 'resources/js/Pages/cms/faq']];
        $remover = new ModuleRemover($this->base);

        $this->assertTrue($remover->isInstalled($module));

        $changed = $remover->remove('faqs', $module);

        $this->assertFalse($remover->isInstalled($module));
        $this->assertDirectoryDoesNotExist($this->base.'/resources/js/Pages/cms/faq');
        $this->assertContains('resources/js/sidebar.ts', $changed);
        $this->assertSame(implode("\r\n", [
            'export const sidebar = [',
            '    { label: "Dashboard" },',
            '    // @module:faqs_extra',
            '    { label: "Other" },',
            '    // @endmodule:faqs_extra',
            '];',
            '',
        ]), File::get($this->base.'/resources/js/sidebar.ts'));
    }

    public function test_removing_twice_is_harmless(): void
    {
        $module = ['paths' => ['routes/cms/faq.php']];
        $remover = new ModuleRemover($this->base);

        $remover->remove('faqs', $module);

        $this->assertSame([], $remover->remove('faqs', $module));
    }

    public function test_every_configured_module_path_exists(): void
    {
        foreach (config('installer.modules') as $key => $module) {
            foreach ($module['paths'] as $path) {
                $this->assertFileExists(base_path($path), "Module [{$key}] lists a missing path.");
            }
        }
    }
}
