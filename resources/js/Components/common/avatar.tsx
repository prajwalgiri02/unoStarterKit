const sizeClasses = {
    small: "size-7 text-link-sm leading-none",
    medium: "size-8 text-link-sm",
    large: "size-[62px] text-subtitle-lg font-medium",
    xlarge: "size-[74px] text-title-sm",
} as const;

type AvatarProps = {
    name: string;
    src?: string | null;
    size?: keyof typeof sizeClasses;
    className?: string;
};

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function Avatar({ name, src, size = "small", className = "" }: AvatarProps) {
    const classes = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${sizeClasses[size]} ${className}`.trim();

    if (src) {
        return <img src={src} alt="" className={`${classes} object-cover`} />;
    }

    return (
        <span aria-hidden="true" className={`${classes} bg-primary-500 text-neutral-50`}>
            {initials(name)}
        </span>
    );
}
