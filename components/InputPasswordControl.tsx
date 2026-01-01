import { Input, InputProps } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface InputPasswordControlProps<T extends FieldValues>
  extends Omit<InputProps, "name"> {
  name: Path<T>;
  register: UseFormRegister<T>;
}

const InputPasswordControl = <T extends FieldValues>({
  name,
  register,
  ...rest
}: InputPasswordControlProps<T>) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Input
      {...register(name)}
      type={isVisible ? "text" : "password"}
      endContent={
        <button type="button" tabIndex={-1} onClick={toggleVisibility}>
          {isVisible ? (
            <Icon
              className="text-default-400 pointer-events-none text-2xl"
              icon="solar:eye-closed-linear"
            />
          ) : (
            <Icon
              className="text-default-400 pointer-events-none text-2xl"
              icon="solar:eye-bold"
            />
          )}
        </button>
      }
      {...rest}
    />
  );
};

export default InputPasswordControl;
