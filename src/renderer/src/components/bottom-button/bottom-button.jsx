import classes from "./bottom-button.module.css";

export default function BottomButton({ className, children, onClick, redStyle }) {
  return (
    <button
      className={`${className} ${redStyle ? classes.redStyle : classes.defaultStyle} ${classes.bottomButton}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
