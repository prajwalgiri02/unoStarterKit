<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePassword;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserManagerService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserManagerService $userManagerService,
    ) {}

    public function index()
    {
        $user = auth()->user();
        return $this->successResponse(new UserResource($user));
    }

    public function store(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $attributes = $request->profileAttributes();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $attributes['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $this->userManagerService->updateUser(
            $user,
            $attributes,
            $user,
        );

        return $this->successResponse(new UserResource($user), 'Profile Updated Successfully', 200);
    }

    public function changePassword(ChangePassword $request)
    {
        $this->userManagerService->changePassword(
            auth()->user(),
            $request->validated('new_password'),
            $request->validated('current_password')
        );

        return $this->successResponse(null, 'Password Changed Successfully', 200);
    }
}
