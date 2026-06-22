<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Services\ProfileUpdateService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileUpdateService $profileUpdateService) {}

    public function show(): Response
    {
        $user = request()->user();

        return Inertia::render('cms/settings/index', [
            'user' => $user->only('id', 'name', 'email'),
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $result = $this->profileUpdateService->initiate(
            $request->user(),
            $request->profileAttributes(),
            $request->file('avatar'),
        );

        if ($result['status'] === 'otp_sent') {
            return back()->with([
                'otp_required' => true,
                'otp_token' => $result['generated']->flowToken,
                'new_email' => $request->input('email'),
                'seconds_remaining' => 120,
                'status' => 'A verification code has been sent to your email to confirm the changes.',
            ]);
        }

        return back()->with('status', 'Profile updated successfully.');
    }
}
