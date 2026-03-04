import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import
{
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CInputProps<T extends FieldValues>
{
    control: Control<T>;
    name: Path<T>;
    className?: string;
    label: string;
    placeholder?: string;
    type?: "text" | "password" | "email" | "number";
    icon?: LucideIcon;
    disabled?: boolean;
    children?: React.ReactNode;
}

export default function CInput<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    type = "text",
    icon: Icon,
    disabled,
    className,
    children,
}: CInputProps<T>)
{
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }) => (
                <Field>
                    <FieldLabel>{label}</FieldLabel>
                    <FieldContent>
                        <InputGroup className={cn(error && "border-red-500", className)}>
                            {Icon && (
                                <InputGroupAddon>
                                    <Icon size={16} className="text-gray-400" />
                                </InputGroupAddon>
                            )}
                            <InputGroupInput
                                {...field}
                                type={resolvedType}
                                placeholder={placeholder}
                                disabled={disabled}
                                aria-invalid={!!error}
                            />
                            {isPassword && (
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </InputGroupAddon>
                            )}
                            {children}
                        </InputGroup>
                        {error && (
                            <p className="mt-1 text-sm text-red-500">{error.message}</p>
                        )}
                    </FieldContent>
                </Field>
            )}
        />
    );
}