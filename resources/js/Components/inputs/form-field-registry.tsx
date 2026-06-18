import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

type Validator = () => string | undefined;

type FormFieldRegistryContextValue = {
    registerValidator: (
        name: string,
        getValidator: () => Validator,
    ) => () => void;
    validateAll: () => boolean;
    clientErrors: Record<string, string>;
    notifyFieldChanged: (name: string) => void;
};

const FormFieldRegistryContext =
    createContext<FormFieldRegistryContextValue | null>(null);

type FormFieldRegistryProviderProps = {
    children: React.ReactNode;
    /** Called when user edits a field so server-side errors can be cleared (e.g. useForm().clearErrors) */
    clearServerFieldError?: (name: string) => void;
};

export function FormFieldRegistryProvider({
    children,
    clearServerFieldError,
}: FormFieldRegistryProviderProps) {
    const validatorsRef = useRef(new Map<string, Validator>());
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    const registerValidator = useCallback(
        (name: string, getLatestValidator: () => Validator) => {
            const wrapped: Validator = () => {
                const validator = getLatestValidator();
                return validator();
            };
            validatorsRef.current.set(name, wrapped);
            return () => {
                if (validatorsRef.current.get(name) === wrapped) {
                    validatorsRef.current.delete(name);
                }
            };
        },
        [],
    );

    const validateAll = useCallback(() => {
        const next: Record<string, string> = {};
        for (const [name, fn] of validatorsRef.current) {
            const message = fn();
            if (message) next[name] = message;
        }
        setClientErrors(next);
        return Object.keys(next).length === 0;
    }, []);

    const notifyFieldChanged = useCallback(
        (name: string) => {
            setClientErrors((prev) => {
                if (!prev[name]) return prev;
                const { [name]: _removed, ...rest } = prev;
                return rest;
            });
            clearServerFieldError?.(name);
        },
        [clearServerFieldError],
    );

    const value = useMemo(
        () => ({
            registerValidator,
            validateAll,
            clientErrors,
            notifyFieldChanged,
        }),
        [registerValidator, validateAll, clientErrors, notifyFieldChanged],
    );

    return (
        <FormFieldRegistryContext.Provider value={value}>
            {children}
        </FormFieldRegistryContext.Provider>
    );
}

export function useFormFieldRegistry(): FormFieldRegistryContextValue {
    const ctx = useContext(FormFieldRegistryContext);
    if (!ctx) {
        throw new Error(
            "useFormFieldRegistry must be used within FormFieldRegistryProvider",
        );
    }
    return ctx;
}

export function useOptionalFormFieldRegistry(): FormFieldRegistryContextValue | null {
    return useContext(FormFieldRegistryContext);
}

/**
 * Registers a field validator; the latest `validate` closure is always read via ref
 * so you can pass an inline function without re-subscribing every render.
 */
export function useRegisterFieldValidator(
    name: string,
    validate: () => string | undefined,
    enabled = true,
): void {
    const ctx = useOptionalFormFieldRegistry();
    const validateRef = useRef(validate);
    validateRef.current = validate;

    useEffect(() => {
        if (!ctx || !enabled) return;
        return ctx.registerValidator(name, () => validateRef.current);
    }, [ctx, name, enabled]);
}
