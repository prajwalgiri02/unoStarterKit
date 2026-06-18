<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Services\ImageUploadService;
use App\Services\ProfileUpdateService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileUpdateService $profileUpdateService,
        private readonly ImageUploadService $imageUploadService,
    ) {}

    public function show(): Response
    {
        $user = auth()->user();

        return Inertia::render('cms/settings/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $attributes = $request->profileAttributes();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $this->imageUploadService->delete($user->avatar);
            }

            $attributes['avatar'] = $this->imageUploadService->upload($request->file('avatar'), 'avatars');
        }

        $result = $this->profileUpdateService->initiate($user, $attributes);

        if ($result['status'] === 'otp_sent') {
            return back()->with([
                'otp_required' => true,
                'otp_token' => $result['generated']->flowToken,
                'new_email' => $attributes['email'] ?? $user->email,
                'seconds_remaining' => 120,
                'status' => 'A verification code has been sent to your email to confirm the changes.',
            ]);
        }

        $user->update($attributes);

        return back()->with('status', 'Profile updated successfully.');
    }
}
