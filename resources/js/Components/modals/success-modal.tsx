import Button from "@/Components/buttons/button";
import Modal from "@/Components/modals/modal";
import { router } from "@inertiajs/react";
import { TickCircleIcon } from "@/Components/icons";
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
                <TickCircleIcon className="size-14 text-primary-600" />
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
