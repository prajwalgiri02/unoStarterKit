<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreFaqRequest;
use App\Http\Requests\Faq\UpdateFaqRequest;
use App\Models\Faq;
use App\Services\FaqsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function __construct(
        private readonly FaqsService $faqsService,
    ) {}

    public function index(): Response
    {
        $faqs = $this->faqsService->listAll();

        return Inertia::render('cms/faq/index', [
            'faqs' => [
                'data' => $faqs->map(fn (Faq $faq): array => [
                    'id' => $faq->id,
                    'title' => $faq->question,
                    'content' => $faq->answer,
                    'status' => 'published',
                ])->values(),
            ],
        ]);
    }

    public function store(StoreFaqRequest $request): RedirectResponse
    {
        $this->faqsService->create($request->faqAttributes());

        return back()->with('status', 'FAQ created successfully.');
    }

    public function update(UpdateFaqRequest $request, Faq $faq): RedirectResponse
    {
        $this->faqsService->update($faq, $request->faqAttributes());

        return back()->with('status', 'FAQ updated successfully.');
    }

    public function destroy(Faq $faq): RedirectResponse
    {
        $this->faqsService->delete($faq);

        return back()->with('status', 'FAQ deleted successfully.');
    }
}
