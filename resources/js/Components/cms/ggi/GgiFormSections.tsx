import React from "react";
import FormInput from "@/components/inputs/email-input";
import SelectInput from "@/components/inputs/select-input";
import FormErrorAlert from "@/components/common/FormErrorAlert";

interface BasicDetailsProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    phases: any[];
    tiers: string[];
}

export const BasicDetailsForm: React.FC<BasicDetailsProps> = ({
    data,
    setData,
    errors,
    phases,
    tiers,
}) => (
    <>
        <div className="row gx-4 mb-3">
            <div className="col-md-6">
                <FormInput
                    id="name"
                    name="name"
                    label="Name"
                    placeholder="Enter name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    error={errors.name}
                />
            </div>
            <div className="col-md-6 mt-3 mt-md-0">
                <SelectInput
                    label="Select Phase"
                    placeholder="Select Phase"
                    value={data.phase_id}
                    options={phases.map((p) => ({
                        value: p.id.toString(),
                        label: p.name,
                    }))}
                    onChange={(val) => {
                        setData("phase_id", val);
                    }}
                    error={errors.phase_id}
                />
            </div>
        </div>
        <div className="row gx-4 mb-3">
            <div className="col-md-6">
                <SelectInput
                    label="Select Tier"
                    placeholder="Select Tier"
                    value={data.tier}
                    options={tiers.map((t) => ({ value: t, label: t }))}
                    onChange={(val) => setData("tier", val)}
                    error={errors.tier}
                />
            </div>
        </div>
        <div className="row gx-4">
            <div className="col-12">
                <div className="flex flex-col gap-2">
                    <label className="caption-md text-neutral-700">
                        Description
                    </label>
                    <textarea
                        className="textarea-large ggi-textarea"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Enter Description"
                        rows={5}
                    ></textarea>
                    {errors.description && (
                        <p className="caption-md text-red-500 mt-1 mb-0">
                            {errors.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </>
);

interface QuestionCardProps {
    question: any;
    index: number;
    onEdit?: (index: number) => void;
    onDelete?: (index: number) => void;
    showDetails?: boolean;
    tier: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question: q,
    index,
    onEdit,
    onDelete,
    showDetails = false,
    tier,
}) => {
    const interactionLabel = q.interaction_type
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());

    return (
        <div className="ggi-question-card" data-id={q.id}>
            <div className="ggi-question-header flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex items-start flex-grow">
                    <div className="ggi-question-drag">
                        <img
                            src="/icons/drag.svg"
                            alt="drag"
                            style={{ cursor: "grab" }}
                        />
                    </div>
                    <div className="ggi-question-content">
                        <p className="ggi-question-text body-md">
                            Q{index + 1}: {q.prompt}
                        </p>
                        <div className="ggi-question-tags">
                            <span className="ggi-tag caption-md pillar">
                                {q.pillar_name}
                            </span>
                            <span className="ggi-tag caption-md type">
                                {q.question_type === "multiple_choice"
                                    ? "Multiple Choice"
                                    : "Short Response"}
                            </span>
                            <span className="ggi-tag caption-md weight">
                                Weight: {q.weight}
                            </span>
                            {interactionLabel && (
                                <span className="ggi-tag caption-md interaction">
                                    {interactionLabel}
                                </span>
                            )}
                        </div>

                        {showDetails && (
                            <div className="mt-3">
                                {q.question_type === "multiple_choice" && (
                                    <div className="ggi-question-options">
                                        {(q.options || []).map(
                                            (opt: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="ggi-option-row"
                                                >
                                                    <span className="ggi-option-pts body-xs">
                                                        {opt.points} pts:
                                                    </span>
                                                    <span className="body-xs">
                                                        {opt.option_text}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {q.question_type === "short_response" && (
                                    <>
                                        <div className="ggi-scoring-section">
                                            <p className="ggi-scoring-label body-xs">
                                                Scoring Keywords (
                                                {q.keywords?.length || 0})
                                            </p>
                                            <div className="ggi-keywords">
                                                {(q.keywords || []).map(
                                                    (
                                                        kw: string,
                                                        idx: number,
                                                    ) => (
                                                        <span
                                                            key={idx}
                                                            className="ggi-keyword"
                                                        >
                                                            {kw}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <p className="ggi-scoring-hint caption-md">
                                            2+ matches = 2 pts, 1 match = 1 pt,
                                            0 matches = 0 pts
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {(onEdit || onDelete) && (
                    <div className="ggi-question-actions ml-auto sm:ml-0 flex-shrink-0">
                        {onEdit && (
                            <button
                                type="button"
                                className="ggi-action-btn edit"
                                onClick={() => onEdit(index)}
                            >
                                <img
                                    src="/icons/edit1.svg"
                                    alt="edit"
                                    width="16"
                                    height="16"
                                />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                className="ggi-action-btn delete"
                                onClick={() => onDelete(index)}
                            >
                                <img
                                    src="/icons/delete-3.svg"
                                    alt="delete"
                                    width="16"
                                    height="16"
                                />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface QuestionListProps {
    questions: any[];
    onAddQuestion?: () => void;
    onEditQuestion?: (index: number) => void;
    onDeleteQuestion?: (index: number) => void;
    listRef: React.RefObject<HTMLDivElement | null>;
    tier: string;
    showDetails?: boolean;
    errors?: any;
    hideHeader?: boolean;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    onAddQuestion,
    onEditQuestion,
    onDeleteQuestion,
    listRef,
    tier,
    showDetails = false,
    errors,
    hideHeader = false,
}) => (
    <>
        {!hideHeader && (
            <div className="flex justify-between flex-col md:flex-row items-start md:items-center gap-2 mb-3">
                <div className="ggi-questions-header">
                    <h3 className="ggi-questions-title body-lg">
                        Questions ({questions.length})
                    </h3>
                </div>
                {onAddQuestion && (
                    <button
                        type="button"
                        className="btns btns-primary btn-medium"
                        onClick={onAddQuestion}
                    >
                        <img
                            src="/icons/plus.svg"
                            alt="plus"
                            width="18"
                            height="18"
                        />
                        <span className="body-sm">Add Question</span>
                    </button>
                )}
            </div>
        )}
        {errors?.questions && <FormErrorAlert message={errors.questions} />}
        <div
            className="flex flex-col gap-4"
            ref={listRef}
            id="detailQuestionsList"
        >
            {questions.length === 0 && (
                <div className="ggi-questions-container">
                    <span className="body-md text-neutral-700">
                        No questions yet.
                    </span>
                </div>
            )}
            {questions.map((q: any, i: number) => (
                <QuestionCard
                    key={q.local_key || q.id || i}
                    question={q}
                    index={i}
                    onEdit={onEditQuestion}
                    onDelete={onDeleteQuestion}
                    showDetails={showDetails}
                    tier={tier}
                />
            ))}
        </div>
    </>
);

interface QuestionPreviewProps {
    questions: any[];
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
    questions,
}) => (
    <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
            <div className="ggi-questions-header">
                <h3 className="ggi-questions-title body-lg">
                    Preview & Publish
                </h3>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            {questions.map((q, i) => (
                <div key={q.id || i} className="ggi-preview-section">
                    <span className="body-md text-neutral-900">
                        Q{i + 1}: {q.prompt}
                    </span>
                    <div className="ggi-question-tags">
                        <span className="ggi-tag caption-md pillar">
                            {q.pillar_name}
                        </span>
                    </div>
                    {q.question_type === "multiple_choice" && (
                        <div className="flex flex-col gap-3 mt-2">
                            {q.options?.map((opt: any, j: number) => (
                                <div
                                    key={j}
                                    className="flex items-center custom-radio-wrapper"
                                >
                                    <input
                                        type="radio"
                                        className="radio-lg"
                                        disabled
                                    />
                                    <label className="body-md text-neutral-700 ml-2">
                                        {opt.option_text}
                                    </label>
                                </div>
                            )) || null}
                        </div>
                    )}
                    {q.question_type === "short_response" && (
                        <div className="mt-2">
                            <textarea
                                className="textarea-large ggi-textarea-preview"
                                rows={4}
                                disabled
                                placeholder="Type the child's response here"
                            ></textarea>
                        </div>
                    )}
                </div>
            ))}
        </div>
        <div className="info-pillar-container mt-4 mb-2">
            <img
                src="/icons/warning.svg"
                alt="warning"
                width="24"
                height="24"
            />
            <span className="body-xs text-neutral-900 ml-2">
                Once published, this GGI will be available for assessment in the
                selected phase and tier.
            </span>
        </div>
    </>
);
