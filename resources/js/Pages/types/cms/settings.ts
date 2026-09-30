/** Mirrors SettingsResource.php */
export interface SettingsUser {
    id: number;
    name: string;
    email: string;
}

export interface SettingsPageProps {
    user: SettingsUser;
    otpLength: number;
    flash: {
        success?: string;
        error?: string;
        otp_required?: boolean;
        new_email?: string;
        seconds_remaining?: number;
    };
}
