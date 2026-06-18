import React from "react";

export const getPhaseClass = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("spark")) return "sparks";
    if (lowerName.includes("kindler")) return "kindlers";
    if (lowerName.includes("flame")) return "flames";
    if (lowerName.includes("beacon")) return "beacons";
    if (lowerName.includes("bearer")) return "light-bearer";
    return "";
};

/** CSS class for waypoints badges/icons (no hyphen, singular lightbearer). */
export const getWaypointPhaseClass = (name: string): string => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("spark")) return "sparks";
    if (lowerName.includes("kindler")) return "kindlers";
    if (lowerName.includes("flame")) return "flames";
    if (lowerName.includes("beacon")) return "beacons";
    if (lowerName.includes("bearer")) return "lightbearer";
    return lowerName.replace(/\s+/g, "");
};

export const getPhaseIcon = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("spark")) return "/icons/spark.svg";
    if (lowerName.includes("kindler")) return "/icons/kindlers.svg";
    if (lowerName.includes("flame")) return "/icons/flames.svg";
    if (lowerName.includes("beacon")) return "/icons/beacons.svg";
    if (lowerName.includes("bearer")) return "/icons/bearer.svg";
    return "";
};

export const getPillarColorClass = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("gratitude")) return "gratitude";
    if (lowerName.includes("empathy")) return "empathy";
    if (lowerName.includes("emotional")) return "emotional";
    if (lowerName.includes("purposeful") || lowerName.includes("identity"))
        return "purposeful";
    return "";
};

export const getPillarIcon = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("gratitude")) return "/icons/gratitude.svg";
    if (lowerName.includes("empathy")) return "/icons/empathy.svg";
    if (lowerName.includes("emotional")) return "/icons/emotional.svg";
    if (lowerName.includes("purposeful") || lowerName.includes("identity"))
        return "/icons/purposeful.svg";
    return null;
};

interface ContentIconProps extends React.HTMLAttributes<HTMLDivElement> {
    type: "phase" | "pillar" | "ggi-phase";
    name: string;
    iconUrl?: string | null;
    colorConfiguration?: any;
    className?: string;
    size?: number;
    imgClassName?: string;
    imgStyle?: React.CSSProperties;
}

const ContentIcon: React.FC<ContentIconProps> = ({
    type,
    name,
    iconUrl,
    colorConfiguration,
    className = "",
    size,
    imgClassName = "",
    imgStyle = {},
    ...props
}) => {
    let iconSrc: string | null = iconUrl || null;
    let colorClass = "";
    let defaultSize = 16;
    let dynamicStyles: React.CSSProperties = {};

    if (type === "phase" || type === "ggi-phase") {
        iconSrc = iconUrl || getPhaseIcon(name) || null;
        colorClass = getPhaseClass(name);
        defaultSize = type === "ggi-phase" ? 18 : 16;

        if (colorConfiguration) {
            const config =
                typeof colorConfiguration === "string"
                    ? JSON.parse(colorConfiguration)
                    : colorConfiguration;
            if (config?.primary) {
                dynamicStyles = {
                    background: config.primary,
                    border: `2px solid ${config.primary}`,
                };
                // Remove hardcoded color class if dynamic color is provided
                colorClass = "";
            }
        }
    } else if (type === "pillar") {
        iconSrc = iconUrl || getPillarIcon(name) || null;
        colorClass = getPillarColorClass(name);
        defaultSize = 18;

        if (colorConfiguration) {
            const config =
                typeof colorConfiguration === "string"
                    ? JSON.parse(colorConfiguration)
                    : colorConfiguration;
            if (config?.primary) {
                dynamicStyles = {
                    background: config.primary,
                };
                // Remove hardcoded color class if dynamic color is provided
                colorClass = "";
            }
        }
    }

    const containerClass =
        type === "ggi-phase" ? "ggi-phase-icon" : "phase-icon";
    const pillarClass = type === "pillar" ? "pillar-icon" : "";
    const finalSize = size || defaultSize;

    return (
        <div
            className={`${containerClass} ${pillarClass} ${iconUrl ? "" : colorClass} ${className}`}
            style={{ ...(iconUrl ? {} : dynamicStyles), ...props.style }}
            {...props}
        >
            {iconSrc && (
                <img
                    src={iconSrc}
                    alt=""
                    className={`${type !== "ggi-phase" ? "phase-icon-img" : ""} ${imgClassName}`}
                    width={finalSize}
                    height={finalSize}
                    loading="lazy"
                    decoding="async"
                    style={{
                        ...(type === "ggi-phase"
                            ? {
                                  width: `${finalSize}px`,
                                  height: `${finalSize}px`,
                              }
                            : {}),
                        ...imgStyle,
                    }}
                />
            )}
        </div>
    );
};

export default ContentIcon;
