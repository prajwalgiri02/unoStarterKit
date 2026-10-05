<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\VerificationChannel;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'phone', 'password', 'avatar', 'location', 'subscription_type'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, hasRoles, Notifiable;

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return ['tv' => (int) $this->token_version];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'blocked_at' => 'datetime',
            'password' => 'hashed',
            'token_version' => 'integer',
        ];
    }

    public function isApprovalRequired(): bool
    {
        return (bool) config('users.require_approval', false);
    }

    public function isApproved(): bool
    {
        if (! $this->isApprovalRequired()) {
            return true;
        }

        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->approved_at !== null;
    }

    public function isPendingApproval(): bool
    {
        return $this->isApprovalRequired() && ! $this->isApproved();
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }

    public function hasVerified(VerificationChannel $channel): bool
    {
        return $this->{$channel->verifiedAtColumn()} !== null;
    }

    /**
     * @return list<VerificationChannel>
     */
    public function pendingVerifications(): array
    {
        if ($this->hasRole('admin')) {
            return [];
        }

        return array_values(array_filter(
            VerificationChannel::cases(),
            fn (VerificationChannel $channel): bool => $channel->isRequired()
                && filled($this->{$channel->attribute()})
                && ! $this->hasVerified($channel),
        ));
    }

    public function isPendingVerification(): bool
    {
        return $this->pendingVerifications() !== [];
    }

    public function firebaseTokens()
    {
        return $this->hasMany(FirebaseTokens::class);
    }
    // @module:notifications

    public function userNotifications()
    {
        return $this->hasMany(UserNotification::class, 'notifiable_id')->where('notifiable_type', self::class);
    }
    // @endmodule:notifications
}
