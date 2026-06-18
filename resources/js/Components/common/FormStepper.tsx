import React from "react";

interface Step {
    id: number;
    label: string;
}
interface FormStepperProps {
    currentStep: number;
    steps: Step[];
}

export default function FormStepper({ currentStep, steps }: FormStepperProps) {
    return (
        <div className="ggi-stepper">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
            <div className="flex items-center steps-of-ggi">
                        <div
                            id={`step${step.id}Indicator`}
                            className={`ggi-step ${currentStep > step.id ? "completed" : currentStep === step.id ? "active" : ""}`}
                        >
                            <div className="ggi-step-number">
                                {currentStep > step.id ? (
                                    <img
                                        src="/icons/complete.svg"
                                        alt="completed"
                                    />
                                ) : (
                                    step.id
                                )}
                            </div>
                            <span className="ggi-step-text body-lg">
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`ggi-step-connector ${currentStep > step.id ? "active" : ""}`}
                            ></div>
                        )}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}
