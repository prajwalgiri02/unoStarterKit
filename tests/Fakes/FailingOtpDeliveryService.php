<?php

declare(strict_types=1);

namespace Tests\Fakes;

use App\Data\GeneratedOtp;
use App\Exceptions\OtpException;
use App\Services\OtpDeliveryService;

class FailingOtpDeliveryService extends OtpDeliveryService
{
    public function __construct() {}

    public function send(GeneratedOtp $generated): void
    {
        throw new OtpException('Delivery failed.');
    }
}
