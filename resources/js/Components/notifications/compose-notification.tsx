import Button from "@/Components/buttons/button";
import Card from "@/Components/common/card";
import Checkbox from "@/Components/inputs/checkbox";
import Input from "@/Components/inputs/input";
import Select from "@/Components/inputs/select";
import Textarea from "@/Components/inputs/textarea";
import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";

export const locationOptions = [
    { value: "QLD", label: "Queensland" },
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "WA", label: "Western Australia" },
    { value: "SA", label: "South Australia" },
];

export default function ComposeNotification() {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        send_to_all: false,
        title: "",
        location: "",
        message: "",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post("/cms/notifications", { preserveScroll: true, onSuccess: () => reset() });
    };

    const cancel = () => {
        reset();
        clearErrors();
    };

    return (
        <Card>
            <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="flex max-w-188 flex-col gap-5">
                    <Checkbox
                        name="send_to_all"
                        label="Send to all users"
                        checked={data.send_to_all}
                        onChange={(e) => setData("send_to_all", e.target.checked)}
                        error={errors.send_to_all}
                    />
                    <Input
                        label="Title"
                        name="title"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        error={errors.title}
                    />
                    <Select
                        label="Location"
                        name="location"
                        placeholder="All locations"
                        options={locationOptions}
                        value={data.location}
                        disabled={data.send_to_all}
                        onChange={(e) => setData("location", e.target.value)}
                        error={errors.location}
                    />
                    <Textarea
                        label="Enter Message"
                        name="message"
                        value={data.message}
                        onChange={(e) => setData("message", e.target.value)}
                        error={errors.message}
                    />
                </div>
                <div className="flex flex-wrap gap-5">
                    <Button type="submit" disabled={processing}>
                        {processing ? "Sending..." : "Send Notification"}
                    </Button>
                    <Button variant="outline" onClick={cancel} disabled={processing}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
}
