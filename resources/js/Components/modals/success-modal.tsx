import Button from "@/Components/buttons/button";
import Modal from "@/Components/modals/modal";
import { router } from "@inertiajs/react";
import { Check } from "lucide-react";
import { useId } from "react";

type SuccessModalProps = {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
};

export default function SuccessModal({
    title,
    description,
    buttonText,
    buttonLink,
}: SuccessModalProps) {
    const titleId = useId();

    return (
        <Modal open dismissible={false} labelledBy={titleId}>
            <div className="flex flex-col items-center gap-5 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary-500 text-base-white">
                    <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <h3 id={titleId} className="text-title-md text-primary-500">
                    {title}
                </h3>
                <div className="flex w-full flex-col gap-6">
                    <p className="text-body-xs text-neutral-700">{description}</p>
                    <Button className="w-full" onClick={() => router.visit(buttonLink)}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
