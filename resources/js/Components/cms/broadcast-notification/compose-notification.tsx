import React from "react";
import SelectInput from "@/components/inputs/select-input";
import TextareaInput from "@/components/inputs/textarea-input";
import CheckboxInput from "@/components/inputs/checkbox-input";
import PrimaryButton from "@/components/buttons/primary-button";

const ComposeNotification: React.FC = () => {
    // Note: These would typically be managed by Inertia's useForm
    const [values, setValues] = React.useState({
        selectAll: false,
        location: "",
        subscriptionType: "",
        tier: "",
        message: "",
    });

    return (
        <div className="legal-content-card">
            <div className="legal-card-content d-flex flex-column gap-4">
                <div className="d-flex align-items-center justify-content-between">
                    <h2 className="subtitle-md">Compose Notification</h2>
                </div>

                <form
                    className="legal-form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <CheckboxInput
                        id="selectAll"
                        name="selectAll"
                        label="Send to all users"
                    />

                    <SelectInput
                        label="Select Users Location"
                        id="location"
                        value={values.location}
                        placeholder="Select User Location"
                        options={[
                            { value: "general", label: "Gold Coast" },
                            { value: "technical", label: "Brisbane" },
                            { value: "billing", label: "Sydney" },
                        ]}
                        onChange={(val) =>
                            setValues({ ...values, location: val })
                        }
                    />

                    <SelectInput
                        label="Select Subscription Types"
                        id="subscriptionTypes"
                        value={values.subscriptionType}
                        placeholder="Select Subscription Type"
                        options={[
                            { value: "all", label: "All" },
                            { value: "free", label: "Free" },
                            { value: "paid", label: "Paid" },
                        ]}
                        onChange={(val) =>
                            setValues({ ...values, subscriptionType: val })
                        }
                    />

                    <SelectInput
                        label="Filter by Tier"
                        id="tier"
                        value={values.tier}
                        placeholder="Select Tier"
                        options={[
                            { value: "all", label: "All" },
                            { value: "free", label: "Free" },
                            { value: "paid", label: "Paid" },
                        ]}
                        onChange={(val) => setValues({ ...values, tier: val })}
                    />

                    <TextareaInput
                        label="Enter Message"
                        id="message"
                        name="message"
                        placeholder="Enter Message"
                        rows={5}
                        value={values.message}
                        className="textarea-large"
                        onChange={(e) =>
                            setValues({ ...values, message: e.target.value })
                        }
                    />

                    <div className="form-buttons">
                        <PrimaryButton type="submit" size="giant">
                            Add Notification
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeNotification;
