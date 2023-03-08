declare module "*.css"
declare module "*.png"
declare module "*.jpg"
declare module "*.svg"

declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}
