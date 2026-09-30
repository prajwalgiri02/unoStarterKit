import type { FormDataKeys, FormDataType, FormDataValues } from "@inertiajs/core";
import { useForm } from "@inertiajs/react";

export default function useFieldForm<TForm extends FormDataType<TForm>>(initial: TForm | (() => TForm)) {
    const form = useForm<TForm>(initial);

    const setField = <K extends FormDataKeys<TForm>>(field: K, value: FormDataValues<TForm, K>) => {
        form.setData(field, value);
        form.clearErrors(field);
    };

    return { ...form, setField };
}
