import { Input, InputProps } from "@heroui/react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface InputControlProps<T extends FieldValues>
  extends Omit<InputProps, "name"> {
  name: Path<T>;
  register: UseFormRegister<T>;
}

const InputControl = <T extends FieldValues>({
  name,
  register,
  ...rest
}: InputControlProps<T>) => {
  return <Input {...register(name)} {...rest} />;
};

export default InputControl;
