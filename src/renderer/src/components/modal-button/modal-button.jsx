import classes from "./modal-button.module.css";

// Компонент кнопки внутри модального окна
export default function ModalButton({ className, onClick, children, redStyle, greenStyle }) {
  return (
    <button
      className={`${className} ${classes.modalButton} ${redStyle && classes.redStyle} ${greenStyle && classes.greenStyle}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
