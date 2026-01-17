import { motion } from "motion/react";
import { ComponentProps, useState } from "react";
import { InputGroup, InputGroupInput } from "../ui/input-group";

const AnimatedInput = ({ placeholder, ...props }: ComponentProps<"input">) => {
  const [isFocus, setIsFocus] = useState(false);
  // only track the length of the input
  const [value, setValue] = useState("");

  return (
    <InputGroup
      className="px-1 h-fit bg-secondary group shadow-none rounded-xl"
      onFocus={() => {
        setIsFocus(true);
      }}
      onBlur={() => {
        if (value.length >= 1) return;

        setIsFocus(false);
      }}
    >
      <InputGroupInput
        {...props}
        className="mt-4.5 mb-1.5 md:text-sm"
        onChange={(e) => {
          setValue(e.target.value);
          props.onChange?.(e);
        }}
      />
      <motion.span
        animate={{
          scale: isFocus ? 0.8 : 1,
          y: isFocus ? -14 : -0,
          x: isFocus ? -6 : 0,
        }}
        transition={{
          ease: "backOut",
          type: "spring",
          damping: 30,
          stiffness: 350,
        }}
        className="pointer-events-none text-muted-foreground font-normal md:text-sm absolute px-3"
      >
        {placeholder}
      </motion.span>
    </InputGroup>
  );
};

export { AnimatedInput };
