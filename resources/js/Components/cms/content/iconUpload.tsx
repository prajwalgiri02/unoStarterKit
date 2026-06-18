import { useId, useRef } from "react";

type IconUploadProps = {
    imageSrc: string;
    onFileSelect?: (file: File) => void;
    label?: string;
    inputId?: string;
    areaId?: string;
    disabled?: boolean;
    circular?: boolean;
};

function IconUpload({
    imageSrc,
    onFileSelect,
    label = "Change Icon",
    inputId,
    areaId = "uploadArea",
    disabled = false,
    circular = false,
}: IconUploadProps) {
    const generatedId = useId();
    const resolvedInputId = inputId ?? `iconUpload-${generatedId}`;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={`upload-section${disabled ? " disabled" : ""}`}>
            <label className="upload-label" htmlFor={resolvedInputId}>
                {label}
            </label>
            <div
                className={`upload-area ${circular ? "circular" : ""}`}
                id={areaId}
                tabIndex={disabled ? -1 : 0}
                style={{
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.7 : 1,
                }}
                onClick={openFileDialog}
                onKeyDown={(event) => {
                    if (
                        !disabled &&
                        (event.key === "Enter" || event.key === " ")
                    ) {
                        event.preventDefault();
                        openFileDialog();
                    }
                }}
                role="button"
                aria-label="Upload Icon"
                aria-disabled={disabled}
            >
                <div className="">
                    <img
                        src={imageSrc || "/icons/upload.svg"}
                        alt={imageSrc ? "Icon preview" : "upload"}
                        width="42"
                        height="42"
                        loading="lazy"
                        decoding="async"
                        style={{
                            width: "42px",
                            height: "42px",
                            objectFit: "cover",
                            borderRadius: circular || imageSrc ? "50%" : "0",
                        }}
                    />
                </div>
                <div className="upload-text">
                    <span className="upload-text-primary body-lg">
                        {disabled ? "Icon upload disabled" : "Click to upload"}
                    </span>
                    <span className="upload-text-secondary">
                        (JPG or PNG, up to 200MB)
                    </span>
                </div>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                id={resolvedInputId}
                accept="image/*"
                style={{ display: "none" }}
                disabled={disabled}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && onFileSelect) {
                        onFileSelect(file);
                    }
                }}
            />
        </div>
    );
}

export default IconUpload;
