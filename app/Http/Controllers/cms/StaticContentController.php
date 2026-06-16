<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaticContent\UpdateStaticContentRequest;
use App\Models\StaticContent;
use App\Services\StaticContentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StaticContentController extends Controller
{
    public function __construct(
        private readonly StaticContentService $staticContentService,
    ) {}

    public function index(): Response
    {
        $contents = $this->staticContentService->listAll();

        return Inertia::render('cms/Admin/StaticContent', [
            'contents' => $contents->map(fn (StaticContent $content): array => [
                'id' => $content->id,
                'type' => $content->type->value,
                'label' => $content->type->label(),
                'title' => $content->title,
                'description' => $content->description,
            ])->values(),
        ]);
    }

    public function update(UpdateStaticContentRequest $request, StaticContent $staticContent): RedirectResponse
    {
        $this->staticContentService->update(
            $staticContent,
            $request->contentAttributes(),
        );

        return back()->with('status', "{$staticContent->type->label()} updated successfully.");
    }
}
