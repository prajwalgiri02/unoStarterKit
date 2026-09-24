import React from "react";
import { useForm } from "@inertiajs/react";
import SelectInput from "@/Components/inputs/select-input";
import TextareaInput from "@/Components/inputs/textarea-input";
import Input from "@/Components/inputs/input";
import Button from "@/Components/buttons/button";

const ComposeNotification: React.FC = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        message: "",
        send_to_all: false,
        location: "",
        subscription_type: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/cms/notifications", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="legal-content-card">
            <div className="legal-card-content flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="subtitle-md">Compose Notification</h2>
                </div>

                <form className="legal-form" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="send_to_all"
                            name="send_to_all"
                            className="checkbox-squared"
                            checked={data.send_to_all}
                            onChange={(e) =>
                                setData("send_to_all", e.target.checked)
                            }
                        />
                        <label
                            htmlFor="send_to_all"
                            className="body-xs text-neutral-600 mb-0"
                        >
                            Send to all users
                        </label>
                    </div>

                    <Input
                        id="title"
                        name="title"
                        label="Notification Title"
                        placeholder="Enter notification title"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        error={errors.title}
                    />

                    <SelectInput
                        label="Select Users Location"
                        id="location"
                        value={data.location}
                        placeholder="Select User Location"
                        options={[
                            { value: "QLD", label: "Queensland" },
                            { value: "NSW", label: "New South Wales" },
                            { value: "VIC", label: "Victoria" },
                            { value: "WA", label: "Western Australia" },
                            { value: "SA", label: "South Australia" },
                        ]}
                        onChange={(val) => setData("location", val)}
                    />

                    <SelectInput
                        label="Select Subscription Type"
                        id="subscription_type"
                        value={data.subscription_type}
                        placeholder="Select Subscription Type"
                        options={[
                            { value: "free", label: "Free" },
                            { value: "monthly", label: "Monthly" },
                            { value: "yearly", label: "Yearly" },
                        ]}
                        onChange={(val) => setData("subscription_type", val)}
                    />

                    <TextareaInput
                        label="Message"
                        id="message"
                        name="message"
                        placeholder="Enter notification message"
                        rows={5}
                        value={data.message}
                        className="textarea-large"
                        onChange={(e) => setData("message", e.target.value)}
                        error={errors.message}
                    />

                    <div className="form-buttons">
                        <Button
                            type="submit"
                            size="giant"
                            disabled={processing}
                        >
                            {processing ? "Sending..." : "Send Notification"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeNotification;
