<?php

namespace App\Http\Resources;

use App\Enums\VerificationChannel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'location' => $this->location,
            'subscription_type' => $this->subscription_type,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()->all()),
            'is_blocked' => $this->isBlocked(),
            'is_approved' => $this->isApproved(),
            'is_email_verified' => $this->email_verified_at !== null,
            'is_phone_verified' => $this->phone_verified_at !== null,
            'pending_verifications' => array_map(fn (VerificationChannel $channel): string => $channel->value, $this->pendingVerifications()),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'phone_verified_at' => $this->phone_verified_at?->toIso8601String(),
            'blocked_at' => $this->blocked_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
