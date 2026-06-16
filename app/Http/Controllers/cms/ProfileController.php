<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Services\ProfileUpdateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileUpdateService $profileUpdateService,
    ) {}

    public function show(): Response
    {
        return Inertia::render('cms/Admin/Settings/Index');
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $attributes = $request->profileAttributes();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $attributes['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $result = $this->profileUpdateService->initiate($user, $attributes);

        if ($result['status'] === 'otp_sent') {
            return redirect()->route('cms.admin.settings.otp.form', [
                'token' => $result['generated']->flowToken,
            ])->with('status', 'A verification code has been sent to your email to confirm the changes.');
        }

        $user->update($attributes);

        return back()->with('status', 'Profile updated successfully.');
    }
}
