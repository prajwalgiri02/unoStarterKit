<?php

namespace App\Http\Controllers\cms\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Providers\RouteServiceProvider;
use App\Services\UserRegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(
        private readonly UserRegistrationService $userRegistrationService,
    ) {}

    public function create(): Response
    {
        return Inertia::render('cms/Auth/Register');
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = $this->userRegistrationService->register($request->userAttributes());

        event(new Registered($user));

        if ($this->userRegistrationService->requiresApproval()) {
            return redirect()
                ->route('cms.auth.login')
                ->with('status', 'Your account has been created and is pending admin approval.');
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::HOME);
    }
}
