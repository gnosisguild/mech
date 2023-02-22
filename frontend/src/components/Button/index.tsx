import clsx from "clsx"

import classes from "./Button.module.css"

interface ButtonProps {
  secondary?: boolean
  className?: string
  children: React.ReactNode
  onClick: () => void
  title?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  secondary,
  className,
  title,
}) => {
  return (
    <button
      className={clsx(
        classes.button,
        secondary && classes.secondary,
        className
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default Button
