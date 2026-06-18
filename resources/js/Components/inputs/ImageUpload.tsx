import { useId, useRef, useState, useEffect, useLayoutEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

const TARGET_ASPECT_RATIO = 1920 / 1080;
const CROPPER_HEIGHT = 480;

function fillCanvasCover(instance: Cropper) {
    const container = instance.getContainerData();
    const image = instance.getImageData();
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const containerRatio = container.width / container.height;

    let width: number;
    let height: number;

    if (imageRatio > containerRatio) {
        height = container.height;
        width = height * imageRatio;
    } else {
        width = container.width;
        height = width / imageRatio;
    }

    instance.setCanvasData({
        left: (container.width - width) / 2,
        top: (container.height - height) / 2,
        width,
        height,
    });
}

function setDefaultCropBox(instance: Cropper) {
    const container = instance.getContainerData();
    let cropWidth: number;
    let cropHeight: number;

    if (container.width / container.height > TARGET_ASPECT_RATIO) {
        cropHeight = container.height;
        cropWidth = cropHeight * TARGET_ASPECT_RATIO;
    } else {
        cropWidth = container.width;
        cropHeight = cropWidth / TARGET_ASPECT_RATIO;
    }

    instance.setCropBoxData({
        left: (container.width - cropWidth) / 2,
        top: (container.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
    });
}

type ImageUploadProps = {
    imageSrc: string;
    onFileSelect?: (file: File) => void;
    onRemove?: () => void;
    label?: string;
    inputId?: string;
    areaId?: string;
    disabled?: boolean;
    acceptTypes?: string;
    recommendedSizeLabel?: string;
    maxSizeLabel?: string;
    maxSizeMB?: number;
    error?: string;
};

function ImageUpload({
    imageSrc,
    onFileSelect,
    onRemove,
    label = "Upload Image",
    inputId,
    areaId = "uploadArea",
    disabled = false,
    acceptTypes = "image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp",
    recommendedSizeLabel = "Recommended size: 1920 × 1080px",
    maxSizeLabel,
    maxSizeMB = 5,
    error,
}: ImageUploadProps) {
    const generatedId = useId();
    const resolvedInputId = inputId ?? `imageUpload-${generatedId}`;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Cropper State
    const [cropperFile, setCropperFile] = useState<File | null>(null);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(true);

    const workareaRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const cropperInstanceRef = useRef<Cropper | null>(null);

    const resolvedMaxSizeLabel =
        maxSizeLabel ?? `JPG, PNG, SVG (upto ${maxSizeMB}MB)`;

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const validateFile = (file: File): boolean => {
        setLocalError(null);
        if (file.size > maxSizeMB * 1024 * 1024) {
            setLocalError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }
        return true;
    };

    const handleFileSelectInternal = (file: File) => {
        if (validateFile(file)) {
            if (cropImageSrc) {
                URL.revokeObjectURL(cropImageSrc);
            }
            const objectUrl = URL.createObjectURL(file);
            setCropImageSrc(objectUrl);
            setCropperFile(file);
            setIsLocked(true); // reset lock to default on new file selection
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelectInternal(file);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!disabled) {
            const file = e.dataTransfer.files?.[0];
            if (file) {
                handleFileSelectInternal(file);
            }
        }
    };

    // Initialize cropper after the portal modal is mounted with stable dimensions.
    useLayoutEffect(() => {
        if (!cropperFile || !cropImageSrc) return;

        const image = imageRef.current;
        const workarea = workareaRef.current;
        if (!image || !workarea) return;

        let cropper: Cropper | null = null;
        let cancelled = false;
        let initFrame = 0;
        let resizeTimeout = 0;

        const applyWorkareaDimensions = () => {
            const width = Math.round(workarea.clientWidth) || 800;
            workarea.style.width = `${width}px`;
            workarea.style.height = `${CROPPER_HEIGHT}px`;
            return { width, height: CROPPER_HEIGHT };
        };

        const finalizeCropperLayout = () => {
            const instance = cropperInstanceRef.current;
            if (!instance) return;

            applyWorkareaDimensions();
            fillCanvasCover(instance);
            if (isLocked) {
                setDefaultCropBox(instance);
            }
        };

        const initCropper = () => {
            if (
                cancelled ||
                imageRef.current !== image ||
                cropperInstanceRef.current
            ) {
                return;
            }

            const { width, height } = applyWorkareaDimensions();
            if (width < 100) {
                initFrame = window.requestAnimationFrame(initCropper);
                return;
            }

            cropper = new Cropper(image, {
                aspectRatio: isLocked ? TARGET_ASPECT_RATIO : NaN,
                viewMode: 1,
                dragMode: "move",
                autoCropArea: 1,
                responsive: true,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                background: true,
                cropBoxMovable: false,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                minContainerWidth: width,
                minContainerHeight: height,
                ready() {
                    finalizeCropperLayout();
                    resizeTimeout = window.setTimeout(
                        finalizeCropperLayout,
                        350,
                    );
                },
            });
            cropperInstanceRef.current = cropper;
        };

        const scheduleInit = () => {
            initFrame = window.requestAnimationFrame(() => {
                initFrame = window.requestAnimationFrame(initCropper);
            });
        };

        if (image.complete && image.naturalWidth > 0) {
            scheduleInit();
        } else {
            image.addEventListener("load", scheduleInit, { once: true });
        }

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(initFrame);
            window.clearTimeout(resizeTimeout);
            cropper?.destroy();
            cropperInstanceRef.current = null;
        };
    }, [cropperFile, cropImageSrc]);

    const handleRotate = (e: React.MouseEvent, degree: number) => {
        e.preventDefault();
        e.stopPropagation();
        cropperInstanceRef.current?.rotate(degree);
    };

    const handleZoom = (e: React.MouseEvent, ratio: number) => {
        e.preventDefault();
        e.stopPropagation();
        cropperInstanceRef.current?.zoom(ratio);
    };

    const toggleAspectRatio = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextState = !isLocked;
        setIsLocked(nextState);
        const instance = cropperInstanceRef.current;
        if (!instance) return;
        instance.setAspectRatio(nextState ? TARGET_ASPECT_RATIO : NaN);
        if (nextState) {
            fillCanvasCover(instance);
            setDefaultCropBox(instance);
        }
    };

    const handleSaveCrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const cropper = cropperInstanceRef.current;
        if (cropper && onFileSelect && cropperFile) {
            const options = isLocked
                ? { width: 1920, height: 1080 }
                : undefined;
            cropper.getCroppedCanvas(options).toBlob(
                (blob) => {
                    if (blob) {
                        const nameParts = cropperFile.name.split(".");
                        const ext =
                            nameParts.length > 1 ? nameParts.pop() : "jpg";
                        const croppedFile = new File(
                            [blob],
                            `${nameParts.join(".")}_cropped.${ext}`,
                            { type: cropperFile.type || "image/jpeg" },
                        );
                        onFileSelect(croppedFile);
                    }
                    closeModal();
                },
                cropperFile.type || "image/jpeg",
                0.95,
            );
        }
    };

    const closeModal = () => {
        setCropperFile(null);
        if (cropImageSrc) {
            URL.revokeObjectURL(cropImageSrc);
            setCropImageSrc(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        return () => {
            if (cropImageSrc) {
                URL.revokeObjectURL(cropImageSrc);
            }
        };
    }, [cropImageSrc]);

    const displayError = error || localError;

    return (
        <div
            className={`waypoint-banner-upload-container${disabled ? " disabled" : ""}`}
        >
            <style>{`
                .cropper-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 27, 48, 0.65);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    padding: 20px;
                    animation: cropperFadeIn 0.2s ease-out;
                }
                .cropper-modal-container {
                    background: #ffffff;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 860px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    border: 1px solid #cbd5e1;
                    overflow: hidden;
                    animation: cropperScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .cropper-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .cropper-modal-title {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    font-size: 16px;
                    color: #0f172a;
                    margin: 0;
                }
                .cropper-modal-close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .cropper-modal-close-btn:hover {
                    background: #f1f5f9;
                }
                .cropper-modal-body {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: #f8fafc;
                }
                .cropper-workarea {
                    width: 100%;
                    height: ${CROPPER_HEIGHT}px;
                    min-height: ${CROPPER_HEIGHT}px;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    flex-shrink: 0;
                    background: #0f172a;
                }
                .cropper-workarea > img.cropper-source-image {
                    position: absolute;
                    width: 0;
                    height: 0;
                    opacity: 0;
                    pointer-events: none;
                }
                .cropper-workarea > .cropper-container {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                .cropper-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding: 0 4px;
                }
                .cropper-btn-group {
                    display: flex;
                    gap: 8px;
                }
                .cropper-control-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #475569;
                    font-size: 18px;
                    font-weight: bold;
                    transition: all 0.2s;
                }
                .cropper-control-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    border-color: #94a3b8;
                }
                .cropper-toggle-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .cropper-toggle-btn {
                    padding: 8px 12px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 16px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cropper-toggle-btn.active {
                    background: #0f7185;
                    color: #ffffff;
                    border-color: #0f7185;
                }
                .cropper-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 18px 24px;
                    border-top: 1px solid #f1f5f9;
                    background: #ffffff;
                }
                .cropper-footer-btn {
                    padding: 10px 20px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .cropper-btn-cancel {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .cropper-btn-cancel:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }
                .cropper-btn-crop {
                    background: #0f7185;
                    color: #ffffff;
                }
                .cropper-btn-crop:hover {
                    background: #0c5c6d;
                }
                @keyframes cropperFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes cropperScaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>

            {label && (
                <label
                    className="waypoint-banner-upload-label"
                    htmlFor={resolvedInputId}
                >
                    {label}
                </label>
            )}

            <div
                className={`waypoint-banner-upload-card ${isDragOver ? "drag-over" : ""} ${imageSrc ? "has-preview" : ""} ${displayError ? "has-error" : ""}`}
                id={areaId}
                tabIndex={disabled ? -1 : 0}
                onClick={!imageSrc ? openFileDialog : undefined}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.7 : 1,
                }}
            >
                {imageSrc ? (
                    // New Premium Uploaded Design (from screenshot/Figma)
                    <div
                        className="waypoint-image-preview-container"
                        style={{ pointerEvents: "auto" }}
                    >
                        <div className="waypoint-image-preview-wrapper">
                            <img src={imageSrc} alt="Preview" />
                        </div>

                        <div className="waypoint-image-actions-row">
                            <button
                                type="button"
                                className="waypoint-change-image-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openFileDialog();
                                }}
                                disabled={disabled}
                            >
                                Change Image
                            </button>

                            {onRemove && (
                                <button
                                    type="button"
                                    className="waypoint-remove-image-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                        setLocalError(null);
                                        onRemove();
                                    }}
                                    disabled={disabled}
                                    title="Delete Image"
                                >
                                    <img
                                        src="/icons/delete-3.svg"
                                        alt="delete"
                                        width="20"
                                        height="20"
                                    />
                                </button>
                            )}
                        </div>

                        <div className="waypoint-upload-instructions">
                            <span className="waypoint-instruction-size">
                                {recommendedSizeLabel}
                            </span>
                            <span className="waypoint-instruction-format">
                                {resolvedMaxSizeLabel}
                            </span>
                        </div>
                    </div>
                ) : (
                    // Standard Empty Dropzone Design
                    <div className="waypoint-banner-upload-content">
                        <div
                            className="waypoint-banner-upload-icon"
                            style={{ marginBottom: "12px" }}
                        >
                            <img
                                src="/icons/uploadimg1.svg"
                                alt="Upload"
                                width="42"
                                height="42"
                            />
                        </div>
                        <span className="waypoint-banner-upload-primary-text">
                            Drag &amp; drop image or{" "}
                            <span className="waypoint-banner-upload-browse">
                                Browse
                            </span>
                        </span>
                        <div className="waypoint-upload-instructions">
                            <span className="waypoint-instruction-size">
                                {recommendedSizeLabel}
                            </span>
                            <span className="waypoint-instruction-format">
                                {resolvedMaxSizeLabel}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                id={resolvedInputId}
                accept={acceptTypes}
                style={{ display: "none" }}
                disabled={disabled}
                onChange={handleFileChange}
            />

            {displayError && (
                <p
                    id={`${resolvedInputId}-error`}
                    className="caption-md text-danger mt-1 mb-0"
                >
                    {displayError}
                </p>
            )}

            {/* Cropper modal rendered in a portal so parent layout cannot shrink the canvas */}
            {cropperFile &&
                cropImageSrc &&
                createPortal(
                    <div className="cropper-modal-overlay">
                        <div className="cropper-modal-container">
                            <div className="cropper-modal-header">
                                <h3 className="cropper-modal-title">
                                    Crop Image
                                </h3>
                                <button
                                    type="button"
                                    className="cropper-modal-close-btn"
                                    onClick={closeModal}
                                >
                                    <img
                                        src="/icons/close-config.svg"
                                        alt="close"
                                        width="20"
                                        height="20"
                                    />
                                </button>
                            </div>
                            <div className="cropper-modal-body">
                                <div
                                    ref={workareaRef}
                                    className="cropper-workarea"
                                >
                                    <img
                                        ref={imageRef}
                                        className="cropper-source-image"
                                        src={cropImageSrc}
                                        alt="To crop"
                                    />
                                </div>
                                <div className="cropper-controls">
                                    <div className="cropper-btn-group">
                                        <button
                                            type="button"
                                            className="cropper-control-btn"
                                            onClick={(e) => handleZoom(e, 0.1)}
                                            title="Zoom In"
                                        >
                                            ＋
                                        </button>
                                        <button
                                            type="button"
                                            className="cropper-control-btn"
                                            onClick={(e) => handleZoom(e, -0.1)}
                                            title="Zoom Out"
                                        >
                                            －
                                        </button>
                                        <button
                                            type="button"
                                            className="cropper-control-btn"
                                            onClick={(e) =>
                                                handleRotate(e, -90)
                                            }
                                            title="Rotate Left"
                                        >
                                            ⟲
                                        </button>
                                        <button
                                            type="button"
                                            className="cropper-control-btn"
                                            onClick={(e) => handleRotate(e, 90)}
                                            title="Rotate Right"
                                        >
                                            ⟳
                                        </button>
                                    </div>
                                    <div className="cropper-toggle-group">
                                        <button
                                            type="button"
                                            className={`cropper-toggle-btn ${isLocked ? "active" : ""}`}
                                            onClick={toggleAspectRatio}
                                        >
                                            {isLocked
                                                ? "Aspect Ratio Locked (16:9)"
                                                : "Aspect Ratio Unlocked (Free)"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="cropper-modal-footer">
                                <button
                                    type="button"
                                    className="cropper-footer-btn cropper-btn-cancel"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="cropper-footer-btn cropper-btn-crop"
                                    onClick={handleSaveCrop}
                                >
                                    Crop &amp; Save
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

export default ImageUpload;
