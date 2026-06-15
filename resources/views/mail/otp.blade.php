<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verification code</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <p>Hello,</p>

    <p>Use the code below to complete your {{ $purposeLabel }}.</p>

    <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
        {{ $code }}
    </p>

    <p>This code expires in {{ $expiresInMinutes }} minutes.</p>

    <p>If you did not request this code, you can safely ignore this message.</p>

    <p>Thanks,<br>{{ config('app.name') }}</p>
</body>
</html>
