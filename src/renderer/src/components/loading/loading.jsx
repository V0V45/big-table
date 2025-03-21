import loadingIcon from "../../assets/loading.svg";
import classes from "./loading.module.css";

export default function Loading({ className }) {
  return <img src={loadingIcon} alt="Загрузка..." className={`${className} ${classes.loading}`} />;
}
