<?php

declare(strict_types=1);

namespace App\Console\Concerns;

use App\Console\InstallAborted;
use InvalidArgumentException;
use Laravel\Prompts\ConfirmPrompt;
use Laravel\Prompts\MultiSelectPrompt;
use Laravel\Prompts\PasswordPrompt;
use Laravel\Prompts\SelectPrompt;
use Laravel\Prompts\TextPrompt;

/**
 * Plain-text replacements for Laravel Prompts' fallbacks. Laravel's own
 * fallbacks re-ask forever when a value is invalid or when input has ended,
 * which floods the terminal. These stop after MAX_ATTEMPTS bad answers or as
 * soon as input ends.
 */
trait BoundedPrompts
{
    private const MAX_ATTEMPTS = 5;

    private function configureBoundedPrompts(): void
    {
        TextPrompt::fallbackUsing(fn (TextPrompt $prompt): string => (string) $this->askUntilValid(
            fn () => $this->components->ask($prompt->label, $prompt->default ?: null) ?? '',
            $prompt->required,
            $prompt->validate,
        ));

        PasswordPrompt::fallbackUsing(fn (PasswordPrompt $prompt): string => (string) $this->askUntilValid(
            fn () => $this->components->secret($prompt->label) ?? '',
            $prompt->required,
            $prompt->validate,
        ));

        ConfirmPrompt::fallbackUsing(fn (ConfirmPrompt $prompt): bool => (bool) $this->askUntilValid(
            fn () => $this->components->confirm($prompt->label, $prompt->default),
            false,
            $prompt->validate,
        ));

        SelectPrompt::fallbackUsing(fn (SelectPrompt $prompt): int|string => $this->askUntilValid(
            fn () => $this->selectOne($prompt->label, $prompt->options, $prompt->default),
            false,
            $prompt->validate,
        ));

        MultiSelectPrompt::fallbackUsing(fn (MultiSelectPrompt $prompt): array => $this->askUntilValid(
            fn () => $this->selectMany($prompt->label, $prompt->options, $prompt->default, $prompt->hint, (bool) $prompt->required),
            $prompt->required,
            $prompt->validate,
        ));
    }

    private function askUntilValid(\Closure $ask, bool|string $required, mixed $validate): mixed
    {
        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            $result = $ask();

            $this->abortIfInputEnded();

            if ($result === null) {
                $this->components->error('Please pick one of the listed numbers.');

                continue;
            }

            if ($required && ($result === '' || $result === [])) {
                $this->components->error(is_string($required) ? $required : 'An answer is required.');

                continue;
            }

            $error = is_callable($validate) ? $validate($result) : null;

            if (is_string($error) && $error !== '') {
                $this->components->error($error);

                continue;
            }

            return $result;
        }

        throw new InstallAborted('Too many invalid answers.');
    }

    private function abortIfInputEnded(): void
    {
        if (! $this->input->isInteractive()) {
            throw new InstallAborted('Input ended before all questions were answered.');
        }
    }

    /**
     * @param  array<int|string, string>  $options
     */
    private function selectOne(string $label, array $options, int|string|null $default): int|string|null
    {
        $keys = array_keys($options);
        $labels = array_values($options);
        $defaultIndex = array_search($default, $keys, false);

        $this->components->info('Type the number of your choice and press Enter.');

        $answer = $this->chooseLabels($label, $labels, $defaultIndex === false ? 0 : (string) $defaultIndex, multiple: false);

        $index = array_search($answer, $labels, true);

        return $index === false ? null : $keys[$index];
    }

    /**
     * @param  array<int|string, string>  $options
     * @param  list<int|string>  $default
     * @return list<int|string>|null
     */
    private function selectMany(string $label, array $options, array $default, string $hint, bool $required): ?array
    {
        $keys = array_keys($options);
        $labels = array_values($options);
        $offset = $required ? 0 : 1;

        if (! $required) {
            array_unshift($labels, 'None');
        }

        $defaultIndexes = [];

        foreach ($default as $key) {
            $index = array_search($key, $keys, false);

            if ($index !== false) {
                $defaultIndexes[] = $index + $offset;
            }
        }

        $this->components->info('Type the numbers separated by commas (for example 1,3) and press Enter. Press Enter alone to keep the default shown in brackets.');

        if ($hint !== '') {
            $this->components->info($hint);
        }

        $answers = $this->chooseLabels($label, $labels, $defaultIndexes === [] ? null : implode(',', $defaultIndexes), multiple: true);

        $selected = [];

        foreach ($answers as $answer) {
            $index = array_search($answer, $labels, true);

            if ($index === false) {
                return null;
            }

            if ($required || $index !== 0) {
                $selected[] = $keys[$index - $offset];
            }
        }

        return array_values(array_unique($selected));
    }

    /**
     * @param  list<string>  $labels
     */
    private function chooseLabels(string $label, array $labels, int|string|null $default, bool $multiple): mixed
    {
        try {
            return $this->components->choice($label, $labels, $default, self::MAX_ATTEMPTS, $multiple);
        } catch (InvalidArgumentException $exception) {
            throw new InstallAborted('Too many invalid answers. '.$exception->getMessage());
        }
    }
}
