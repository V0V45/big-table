import classes from "./bottom-button.module.css";

// Компонент нижней кнопки (как удаления, так и генерации данных)
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
