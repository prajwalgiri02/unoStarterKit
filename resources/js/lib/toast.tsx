import Alert from "@/Components/feedback/alert";
import { toast } from "sonner";

const toastClassName = "w-[418px] max-w-[calc(100vw-2rem)] shadow-panel";

export const notify = {
    success(message: string) {
        toast.custom(() => <Alert tone="success" title={message} className={toastClassName} />, { id: message });
    },
    error(message: string) {
        toast.custom(() => <Alert tone="error" title={message} className={toastClassName} />, { id: message });
    },
};
