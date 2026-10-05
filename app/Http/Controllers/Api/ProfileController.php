<?php

namespace App\Http\Controllers\Api;

use App\Enums\VerificationChannel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePassword;
use App\Http\Requests\Profile\DeleteAccountRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\ImageUploadService;
use App\Services\UserManagerService;
use App\Services\UserVerificationService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserManagerService $userManagerService,
        private readonly ImageUploadService $imageUploadService,
        private readonly UserVerificationService $verificationService,
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
            $oldAvatar = $user->avatar;
            $attributes['avatar'] = $this->imageUploadService->upload($request->file('avatar'), 'avatars');

            if ($oldAvatar) {
                $this->imageUploadService->delete($oldAvatar);
            }
        }

        $previous = ['email' => $user->email, 'phone' => $user->phone];

        [$updated, $changed] = DB::transaction(function () use ($user, $attributes, $previous, $request): array {
            $updated = $this->userManagerService->updateUser(
                $user,
                $attributes,
                $user,
            );

            $changed = array_values(array_filter(
                $updated->pendingVerifications(),
                fn (VerificationChannel $channel): bool => $previous[$channel->attribute()] !== $updated->{$channel->attribute()},
            ));

            $this->verificationService->sendCodes($updated, $changed, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return [$updated, $changed];
        });

        return $this->successResponse(new UserResource($updated), $this->updatedMessage($changed), 200);
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

    public function destroy(DeleteAccountRequest $request)
    {
        $user = auth()->user();
        $avatar = $user->avatar;

        $this->userManagerService->deleteOwnAccount($user);

        if ($avatar) {
            $this->imageUploadService->delete($avatar);
        }

        auth()->logout();

        return $this->successResponse(null, 'Account deleted successfully');
    }

    /**
     * @param  list<VerificationChannel>  $changed
     */
    private function updatedMessage(array $changed): string
    {
        if ($changed === []) {
            return 'Profile Updated Successfully';
        }

        $labels = implode(' and ', array_map(fn (VerificationChannel $channel): string => $channel->label(), $changed));

        return "Profile Updated Successfully. We have sent a verification code to your new {$labels}.";
    }
}
