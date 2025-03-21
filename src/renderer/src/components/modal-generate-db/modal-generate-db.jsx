import classes from "./modal-generate-db.module.css";
import Modal from "react-modal";
import ModalButton from "../modal-button/modal-button";
import { useState } from "react";
import Loading from "../loading/loading";

// Компонент модального окна генерации базы данных
export default function ModalGenerateDb({
  modalIsOpen,
  handleCloseModal,
  handleGenerate,
  isLoading
}) {
  const [value, setValue] = useState("");

  function handleChange(event) {
    setValue(event.target.value);
  }

  function handleClick() {
    if (value) handleGenerate(value);
    else handleGenerate(0);
  }

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleCloseModal}
      className={classes.modal}
      overlayClassName={classes.overlay}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <h2 className={classes.h2}>Сколько строк сгенерировать?</h2>
          <input type="number" className={classes.input} value={value} onChange={handleChange} />
          <div className={classes.buttons}>
            <ModalButton onClick={handleClick} className={classes.generateButton} greenStyle>
              Сгенерировать
            </ModalButton>
            <ModalButton onClick={handleCloseModal} redStyle>
              Отменить
            </ModalButton>
          </div>
        </>
      )}
    </Modal>
  );
}
