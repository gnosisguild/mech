import clsx from "clsx"

import classes from "./Button.module.css"

interface ButtonProps {
  secondary?: boolean
  className?: string
  children: React.ReactNode
  onClick: () => void
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  secondary,
  className,
}) => {
  return (
    <button
      className={clsx(
        classes.button,
        secondary && classes.secondary,
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
