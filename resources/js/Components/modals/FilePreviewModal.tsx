import React, { useEffect, useRef } from "react";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: string[];
}

const FilePreviewModal = ({
    isOpen,
    onClose,
    files,
}: FilePreviewModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            <div
                className="modal fade show"
                id="filePreviewModal"
                style={{ display: "block" }}
                tabIndex={-1}
                aria-modal="true"
                role="dialog"
                onClick={handleBackdropClick}
                ref={modalRef}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content modal-content-file">
                        <div className="modal-body view-files-details d-flex flex-column">
                            <span className="title-ex-small text-neutral-900 text-start d-block">
                                View Files
                            </span>
                            <div className="d-flex flex-column flex-sm-row gap-4">
                                {files.length === 0 ? (
                                    <p className="body-xs text-neutral-500">
                                        No files uploaded.
                                    </p>
                                ) : (
                                    files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <div className="file-upload-svg">
                                                <img
                                                    src="/icons/file.svg"
                                                    alt="file"
                                                    width="14"
                                                    height="14"
                                                />
                                            </div>
                                            <a
                                                href="#"
                                                className="text-decoration-underline body-xs text-primary-500 text-nowrap"
                                            >
                                                {file}
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="preview-files-details">
                                <span className="file-text">File Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilePreviewModal;
