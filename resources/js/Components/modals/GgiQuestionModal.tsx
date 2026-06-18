import React, { useEffect, useState } from "react";
import SelectInput from "@/components/inputs/select-input";
import PrimaryButton from "@/components/buttons/primary-button";

interface GgiQuestionModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    pillars: any[];
    questionTypes: string[];
    interactionTypes: string[];
    tier: string;
    errors?: any;
    title?: string;
}

export default function GgiQuestionModal({
    show,
    onClose,
    onSave,
    initialData,
    pillars,
    questionTypes,
    interactionTypes,
    tier,
    errors: externalErrors = {},
    title = "Question",
}: GgiQuestionModalProps) {
    const [qPrompt, setQPrompt] = useState("");
    const [qPillarId, setQPillarId] = useState("");
    const [qWeight, setQWeight] = useState("1");
    const [qType, setQType] = useState("");
    const [qInteraction, setQInteraction] = useState("");
    const [qKeywords, setQKeywords] = useState("");
    const [qOptions, setQOptions] = useState([
        { option_text: "", points: 0 },
        { option_text: "", points: 1 },
        { option_text: "", points: 2 },
    ]);
    const [localErrors, setLocalErrors] = useState<any>({});

    useEffect(() => {
        if (show) {
            setQPrompt(initialData?.prompt || "");
            setQPillarId(initialData?.pillar_id?.toString() || "");
            setQWeight(initialData?.weight?.toString() || "1");
            setQType(initialData?.question_type || "");
            setQInteraction(initialData?.interaction_type || "");
            if (initialData?.question_type === "short_response") {
                setQKeywords(
                    Array.isArray(initialData.keywords)
                        ? initialData.keywords.join(", ")
                        : "",
                );
            } else {
                setQOptions(
                    initialData?.options && initialData.options.length
                        ? initialData.options.map((opt: any) => ({ ...opt }))
                        : [
                              { option_text: "", points: 0 },
                              { option_text: "", points: 1 },
                              { option_text: "", points: 2 },
                          ],
                );
            }
            setLocalErrors({});
        }
    }, [show, initialData]);

    const handleSave = () => {
        const errors: any = {};
        if (!qPrompt.trim()) errors.prompt = "Prompt is required";
        if (!qPillarId) errors.pillar_id = "Pillar is required";
        if (!qType) errors.question_type = "Question type is required";

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }

        onSave({
            prompt: qPrompt,
            pillar_id: qPillarId,
            weight: qWeight,
            question_type: qType,
            interaction_type: qInteraction,
            keywords:
                qType === "short_response"
                    ? qKeywords
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k)
                    : [],
            options: qType === "multiple_choice" ? qOptions : [],
        });
    };

    if (!show) return null;

    const mergedErrors = { ...localErrors, ...externalErrors };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
            <div className="modal-dialog modal-permissions-dialog modal-dialog-centered">
                <div className="modal-content modal-permissions">
                    <div className="ggi-modal-header modal-permission-header">
                        <h3 className="title-xs">{title}</h3>
                        <button
                            type="button"
                            className="modal-close"
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: "none",
                            }}
                        >
                            <img
                                src="/icons/close.svg"
                                alt="close"
                                width="16"
                                height="16"
                            />
                        </button>
                    </div>
                    <div className="ggi-modal-body">
                        <form className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="caption-md text-neutral-700">
                                    Question Prompt
                                </label>
                                <textarea
                                    className={`textarea-large ${mergedErrors.prompt ? "border-red-500" : ""}`}
                                    value={qPrompt}
                                    onChange={(e) => setQPrompt(e.target.value)}
                                    placeholder="Enter the question text"
                                    rows={5}
                                ></textarea>
                                {mergedErrors.prompt && (
                                    <span className="caption-md text-red-500">
                                        {mergedErrors.prompt}
                                    </span>
                                )}
                            </div>
                            <div className="row gx-4">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <SelectInput
                                        label="Select Pillar"
                                        placeholder="Select Pillar"
                                        value={qPillarId}
                                        options={pillars.map((p) => ({
                                            value: p.id.toString(),
                                            label:
                                                tier.toLowerCase() === "ikthus"
                                                    ? p.ikthus_name
                                                    : p.origin_name,
                                        }))}
                                        onChange={(val) => setQPillarId(val)}
                                        error={mergedErrors.pillar_id}
                                    />
                                </div>
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <div className="flex flex-col gap-2">
                                        <label className="caption-md text-neutral-700">
                                            Weight
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className={`input-giant ${mergedErrors.weight ? "border-red-500" : ""}`}
                                            value={qWeight}
                                            onChange={(e) =>
                                                setQWeight(e.target.value)
                                            }
                                            placeholder="Enter weight"
                                        />
                                        {mergedErrors.weight && (
                                            <span className="caption-md text-red-500">
                                                {mergedErrors.weight}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row gx-4">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <SelectInput
                                        label="Select Question Type"
                                        placeholder="Select Question Type"
                                        value={qType}
                                        options={questionTypes.map((t) => ({
                                            value: t,
                                            label: t
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase(),
                                                ),
                                        }))}
                                        onChange={(val) => setQType(val)}
                                        error={mergedErrors.question_type}
                                    />
                                </div>
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <SelectInput
                                        label="Interaction Type"
                                        placeholder="Select Interaction Type"
                                        value={qInteraction}
                                        options={interactionTypes.map((t) => ({
                                            value: t,
                                            label: t
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase(),
                                                ),
                                        }))}
                                        onChange={(val) => setQInteraction(val)}
                                        error={mergedErrors.interaction_type}
                                    />
                                </div>
                            </div>
                            {qType === "multiple_choice" && (
                                <div className="flex flex-col gap-2">
                                    <label className="body-xs text-neutral-900 mb-1">
                                        Response Options
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {[0, 1, 2].map((idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="response-number">
                                                    {idx}
                                                </div>
                                                <input
                                                    type="text"
                                                    className="input-giant"
                                                    value={
                                                        qOptions[idx]
                                                            ?.option_text || ""
                                                    }
                                                    onChange={(e) => {
                                                        const newOpts = [
                                                            ...qOptions,
                                                        ];
                                                        newOpts[
                                                            idx
                                                        ].option_text =
                                                            e.target.value;
                                                        setQOptions(newOpts);
                                                    }}
                                                    placeholder="Response text..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {mergedErrors.options && (
                                        <span className="caption-md text-red-500">
                                            {mergedErrors.options}
                                        </span>
                                    )}
                                </div>
                            )}
                            {qType === "short_response" && (
                                <div className="flex flex-col gap-2">
                                    <label className="body-xs text-neutral-900 mb-2">
                                        Scoring Keywords (comma-separated)
                                    </label>
                                    <textarea
                                        className={`textarea-large ${mergedErrors.keywords ? "border-red-500" : ""}`}
                                        value={qKeywords}
                                        onChange={(e) =>
                                            setQKeywords(e.target.value)
                                        }
                                        placeholder="kind, brave, honest, helpful, caring..."
                                        rows={4}
                                        style={{
                                            boxSizing: "border-box",
                                            padding: "12px 16px",
                                            border: mergedErrors.keywords
                                                ? "1.5px solid #ef4444"
                                                : "1.5px solid #E7E8EA",
                                            borderRadius: "20px",
                                            width: "100%",
                                            minHeight: "120px",
                                            height: "auto",
                                            resize: "vertical",
                                            outline: "none",
                                        }}
                                    ></textarea>
                                    {mergedErrors.keywords && (
                                        <span className="caption-md text-red-500">
                                            {mergedErrors.keywords}
                                        </span>
                                    )}
                                    <span className="caption-md text-neutral-500 block mt-1">
                                        2+ matches = 2 pts, 1 match = 1 pt, 0
                                        matches = 0 pts
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row w-full gap-4 mt-2">
                                <button
                                    type="button"
                                    className="btns btn-gaints btns-secondary text-btn-500"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <PrimaryButton
                                    type="button"
                                    size="giant"
                                    className="text-btn-500"
                                    onClick={handleSave}
                                >
                                    Save Question
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
