import loadingIcon from "../../assets/loading.svg";
import classes from "./loading.module.css";

// Компонент загрузки данных (анимированные песочные часы)
export default function Loading({ className }) {
  return <img src={loadingIcon} alt="Загрузка..." className={`${className} ${classes.loading}`} />;
}
